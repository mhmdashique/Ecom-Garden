import express from "express";
import Joi from "joi";
import { db, genId } from "../utils/memoryStore.js";
import { auth, adminOnly } from "../middleware/auth.js";
import supabase from "../config/supabase.js";

const router = express.Router();

// Validation schemas
const plantCreateSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  botanical_name: Joi.string().allow("", null).max(200),
  botanical: Joi.string().allow("", null).max(200),
  category_id: Joi.string().allow("", null),
  sku: Joi.string().allow("", null).max(50),
  price: Joi.number().min(0).required(),
  discount_price: Joi.number().allow(null, "").min(0),
  wholesale_price: Joi.number().allow(null, "").min(0),
  market_price: Joi.number().allow(null, "").min(0),
  stock_qty: Joi.number().integer().min(0).default(0),
  stock_status: Joi.string()
    .valid("in_stock", "low_stock", "out_of_stock")
    .allow("", null),
  short_description: Joi.string().allow("", null).max(500),
  long_description: Joi.string().allow("", null).max(5000),
  description: Joi.string().allow("", null).max(5000),
  sunlight: Joi.string()
    .allow("", null)
    .valid("Full", "Indirect", "Bright", "Low", "Full Sun", "Partial Shade")
    .insensitive(),
  watering_frequency: Joi.string().allow("", null).max(200),
  soil_type: Joi.string().allow("", null).max(200),
  temperature_range: Joi.string().allow("", null).max(100),
  humidity_preference: Joi.string().allow("", null).max(100),
  fertilizer_schedule: Joi.string().allow("", null).max(200),
  pet_safe: Joi.boolean().allow(null),
  growth_rate: Joi.string().allow("", null).valid("slow", "medium", "fast"),
  mature_size: Joi.string().allow("", null).max(200),
  difficulty_level: Joi.string()
    .allow("", null)
    .valid("easy", "medium", "hard"),
  pot_included: Joi.boolean().allow(null),
  pot_size: Joi.string().allow("", null).max(100),
  height_at_shipping: Joi.string().allow("", null).max(100),
  weight: Joi.string().allow("", null).max(100),
  care_instructions: Joi.string().allow("", null).max(2000),
  rating: Joi.number().min(0).max(5).allow(null, ""),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string().uri({ allowRelative: true }).allow("")),
    Joi.string().allow("", null),
  ),
  image_url: Joi.string().allow("", null),
  type: Joi.string().allow("", null),
  care_level: Joi.string().allow("", null),
  origin: Joi.string().allow("", null),
});

const plantUpdateSchema = plantCreateSchema.fork(
  Object.keys(plantCreateSchema.describe().keys),
  (s) => s.optional(),
);

function deriveStockStatus(qty) {
  if (qty === 0) return "out_of_stock";
  if (qty < 10) return "low_stock";
  return "in_stock";
}

function normalizeImages(data) {
  if (Array.isArray(data.images)) return data.images.filter(Boolean);
  if (typeof data.images === "string" && data.images.trim())
    return [data.images.trim()];
  if (typeof data.image_url === "string" && data.image_url.trim())
    return [data.image_url.trim()];
  return undefined;
}

function sanitizePayload(raw, isUpdate = false) {
  const payload = { ...raw };
  // alias botanical -> botanical_name
  if (payload.botanical && !payload.botanical_name)
    payload.botanical_name = payload.botanical;
  // description -> long_description fallback
  if (payload.description && !payload.long_description)
    payload.long_description = payload.description;
  if (
    payload.short_description === undefined &&
    payload.description &&
    !isUpdate
  )
    payload.short_description = payload.description.slice(0, 120);

  // coerce numbers
  [
    "price",
    "discount_price",
    "wholesale_price",
    "market_price",
    "rating",
  ].forEach((k) => {
    if (payload[k] === "" || payload[k] === null) payload[k] = null;
    if (payload[k] !== undefined && payload[k] !== null)
      payload[k] = Number(payload[k]);
    if (Number.isNaN(payload[k])) payload[k] = null;
  });
  if (
    payload.stock_qty !== undefined &&
    payload.stock_qty !== null &&
    payload.stock_qty !== ""
  )
    payload.stock_qty = Number(payload.stock_qty);
  // stock_status auto
  if (payload.stock_qty !== undefined && !payload.stock_status) {
    payload.stock_status = deriveStockStatus(Number(payload.stock_qty) || 0);
  }
  // normalize images
  const imgs = normalizeImages(payload);
  if (imgs) payload.images = imgs;
  else if (!isUpdate)
    payload.images = [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
    ];
  delete payload.image_url;
  // cleanup empty strings to null for optional text
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "") payload[k] = null;
  });
  return payload;
}

async function supabaseAvailable() {
  // only use supabase when service/secret key is real (not masked) — otherwise anon/publishable RLS blocks writes
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";
  if (!supabase) return false;
  if (secret.includes("•") || secret === "your-service-role-key" || !secret)
    return false;
  return true;
}

// Helpers for Supabase fallback
async function supabaseGetPlants({
  category,
  search,
  minPrice,
  maxPrice,
  sunlight,
  sort,
  page,
  limit,
  categories,
}) {
  try {
    let query = supabase.from("plants").select("*", { count: "exact" });
    // supabase filtering: do simple filters in memory after fetch for stock parity, or use ilike
    if (search) query = query.ilike("name", `%${search}%`);
    if (category) {
      // try to resolve category id from name
      const cat = categories.find(
        (c) =>
          c.name.toLowerCase() === category.toLowerCase() || c.id === category,
      );
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));
    if (sunlight) query = query.ilike("sunlight", sunlight);
    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc")
      query = query.order("price", { ascending: false });
    else if (sort === "newest")
      query = query.order("created_at", { ascending: false });
    else if (sort === "popular")
      query = query.order("rating", { ascending: false });
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) throw error;
    // fetch images for these plants
    if (data && data.length) {
      const ids = data.map((p) => p.id);
      const { data: imgs } = await supabase
        .from("plant_images")
        .select("*")
        .in("plant_id", ids)
        .order("display_order");
      const map = new Map();
      (imgs || []).forEach((img) => {
        if (!map.has(img.plant_id)) map.set(img.plant_id, []);
        map.get(img.plant_id).push(img.image_url);
      });
      data.forEach((p) => (p.images = map.get(p.id) || p.images || []));
    }
    return {
      plants: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
      categories,
    };
  } catch (e) {
    console.warn(
      "[plants] supabase query failed, fallback to memory",
      e.message,
    );
    return null;
  }
}

// GET /api/plants?category=&search=&sort=&minPrice=&maxPrice=&page=1&limit=12
router.get("/", async (req, res) => {
  let {
    category,
    search,
    sort,
    minPrice,
    maxPrice,
    sunlight,
    page = 1,
    limit = 12,
  } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const categories = db.categories;

  if (await supabaseAvailable()) {
    const sb = await supabaseGetPlants({
      category,
      search,
      minPrice,
      maxPrice,
      sunlight,
      sort,
      page,
      limit,
      categories,
    });
    // Keep the seeded development catalog visible until the remote catalog has products.
    if (sb && (sb.total > 0 || db.plants.length === 0)) return res.json(sb);
  }
  // memory fallback
  let result = [...db.plants];
  if (category)
    result = result.filter(
      (p) =>
        p.category_id === category ||
        db.categories
          .find((c) => c.id === p.category_id)
          ?.name.toLowerCase() === category.toLowerCase(),
    );
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.botanical_name || "").toLowerCase().includes(s) ||
        (p.sku || "").toLowerCase().includes(s) ||
        (p.short_description || "").toLowerCase().includes(s) ||
        (p.long_description || "").toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s),
    );
  }
  if (minPrice)
    result = result.filter(
      (p) => (p.discount_price || p.price) >= parseFloat(minPrice),
    );
  if (maxPrice)
    result = result.filter(
      (p) => (p.discount_price || p.price) <= parseFloat(maxPrice),
    );
  if (sunlight)
    result = result.filter(
      (p) => (p.sunlight || "").toLowerCase() === sunlight.toLowerCase(),
    );
  if (sort === "price_asc")
    result.sort(
      (a, b) => (a.discount_price || a.price) - (b.discount_price || b.price),
    );
  if (sort === "price_desc")
    result.sort(
      (a, b) => (b.discount_price || b.price) - (a.discount_price || a.price),
    );
  if (sort === "newest")
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sort === "popular")
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const total = result.length;
  const paged = result.slice((page - 1) * limit, page * limit);
  res.json({
    plants: paged,
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (await supabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        const { data: imgs } = await supabase
          .from("plant_images")
          .select("image_url,display_order")
          .eq("plant_id", id)
          .order("display_order");
        if (imgs) data.images = imgs.map((i) => i.image_url);
        const { data: reviews } = await supabase
          .from("plant_reviews")
          .select("*")
          .eq("plant_id", id)
          .order("created_at", { ascending: false })
          .limit(20);
        // related
        const { data: relatedRaw } = await supabase
          .from("plants")
          .select("id,name,price,images:plant_images(image_url)")
          .eq("category_id", data.category_id)
          .neq("id", id)
          .limit(4);
        const related = (relatedRaw || []).map((r) => ({
          ...r,
          images: r.images?.map?.((i) => i.image_url) || [],
        }));
        return res.json({ ...data, reviews: reviews || [], related });
      }
    } catch (e) {
      /* fallback */
    }
  }
  const plant = db.plants.find((p) => p.id === req.params.id);
  if (!plant) return res.status(404).json({ error: "Not found" });
  const reviews = db.reviews.filter((r) => r.plant_id === plant.id);
  const related = db.plants
    .filter((p) => p.category_id === plant.category_id && p.id !== plant.id)
    .slice(0, 4);
  res.json({ ...plant, reviews, related });
});

router.post("/", auth, adminOnly, async (req, res) => {
  const { error, value } = plantCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: false,
  });
  if (error)
    return res
      .status(400)
      .json({ error: error.details.map((d) => d.message).join(", ") });
  const data = sanitizePayload(value, false);
  if (!data.stock_status)
    data.stock_status = deriveStockStatus(Number(data.stock_qty) || 0);
  // ensure sku unique in memory (supabase will also enforce)
  if (data.sku && db.plants.find((p) => p.sku === data.sku))
    return res.status(400).json({ error: "SKU already exists" });

  if (await supabaseAvailable()) {
    try {
      const insert = { ...data };
      const images = insert.images;
      delete insert.images;
      insert.created_at = new Date().toISOString();
      insert.updated_at = new Date().toISOString();
      const { data: created, error: insErr } = await supabase
        .from("plants")
        .insert([insert])
        .select()
        .single();
      if (insErr) throw insErr;
      if (images && images.length) {
        const rows = images.map((url, i) => ({
          plant_id: created.id,
          image_url: url,
          display_order: i,
        }));
        await supabase.from("plant_images").insert(rows);
        created.images = images;
      } else created.images = [];
      // also push to memory for dev parity
      db.plants.push({
        id: created.id,
        ...created,
        images: created.images,
        created_at: created.created_at,
        updated_at: created.updated_at,
      });
      return res.status(201).json(created);
    } catch (e) {
      console.warn("[plants] supabase insert failed, falling back", e.message);
      // fall through to memory
    }
  }

  const plant = {
    id: genId(),
    rating: data.rating ?? 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data,
  };
  if (!plant.stock_status)
    plant.stock_status = deriveStockStatus(Number(plant.stock_qty) || 0);
  if (!plant.images)
    plant.images = [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
    ];
  db.plants.push(plant);
  // sync plant_images for memory
  if (plant.images)
    plant.images.forEach((url, i) =>
      db.plant_images.push({
        id: genId(),
        plant_id: plant.id,
        image_url: url,
        display_order: i,
      }),
    );
  res.status(201).json(plant);
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const { error, value } = plantUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: false,
  });
  if (error)
    return res
      .status(400)
      .json({ error: error.details.map((d) => d.message).join(", ") });
  const patch = sanitizePayload(value, true);
  // sku uniqueness
  if (patch.sku) {
    const dup = db.plants.find(
      (p) => p.sku === patch.sku && p.id !== req.params.id,
    );
    if (dup) return res.status(400).json({ error: "SKU already exists" });
  }

  if (await supabaseAvailable()) {
    try {
      const images = patch.images;
      delete patch.images;
      const updatePayload = { ...patch, updated_at: new Date().toISOString() };
      // remove undefined
      Object.keys(updatePayload).forEach(
        (k) => updatePayload[k] === undefined && delete updatePayload[k],
      );
      const { data: updated, error: updErr } = await supabase
        .from("plants")
        .update(updatePayload)
        .eq("id", req.params.id)
        .select()
        .single();
      if (updErr) throw updErr;
      if (images !== undefined) {
        await supabase
          .from("plant_images")
          .delete()
          .eq("plant_id", req.params.id);
        if (images.length) {
          const rows = images.map((url, i) => ({
            plant_id: req.params.id,
            image_url: url,
            display_order: i,
          }));
          await supabase.from("plant_images").insert(rows);
        }
        updated.images = images;
      } else {
        const { data: imgs } = await supabase
          .from("plant_images")
          .select("image_url")
          .eq("plant_id", req.params.id)
          .order("display_order");
        updated.images = (imgs || []).map((i) => i.image_url);
      }
      // sync memory
      const mem = db.plants.find((p) => p.id === req.params.id);
      if (mem) Object.assign(mem, updated);
      else db.plants.push(updated);
      return res.json(updated);
    } catch (e) {
      console.warn("[plants] supabase update failed, fallback", e.message);
    }
  }

  const plant = db.plants.find((p) => p.id === req.params.id);
  if (!plant) return res.status(404).json({ error: "Not found" });
  // handle images separately for memory store
  if (patch.images !== undefined) {
    plant.images = patch.images;
    // sync plant_images table
    db.plant_images = db.plant_images.filter((pi) => pi.plant_id !== plant.id);
    patch.images.forEach((url, i) =>
      db.plant_images.push({
        id: genId(),
        plant_id: plant.id,
        image_url: url,
        display_order: i,
      }),
    );
    delete patch.images;
  }
  Object.assign(plant, patch);
  plant.updated_at = new Date().toISOString();
  // ensure stock_status sync
  if (patch.stock_qty !== undefined && !patch.stock_status)
    plant.stock_status = deriveStockStatus(Number(plant.stock_qty));
  if (!plant.stock_status)
    plant.stock_status = deriveStockStatus(Number(plant.stock_qty) || 0);
  res.json(plant);
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  if (await supabaseAvailable()) {
    try {
      await supabase
        .from("plant_images")
        .delete()
        .eq("plant_id", req.params.id);
      const { error } = await supabase
        .from("plants")
        .delete()
        .eq("id", req.params.id);
      if (error) throw error;
      const idx = db.plants.findIndex((p) => p.id === req.params.id);
      if (idx !== -1) db.plants.splice(idx, 1);
      db.plant_images = db.plant_images.filter(
        (pi) => pi.plant_id !== req.params.id,
      );
      return res.json({ message: "Deleted" });
    } catch (e) {
      console.warn("[plants] supabase delete failed", e.message);
    }
  }
  const idx = db.plants.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.plants.splice(idx, 1);
  db.plant_images = db.plant_images.filter(
    (pi) => pi.plant_id !== req.params.id,
  );
  res.json({ message: "Deleted" });
});

// Bulk helpers used by admin
router.post("/bulk/stock", auth, adminOnly, (req, res) => {
  const { ids, stock_qty } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ error: "ids required" });
  ids.forEach((id) => {
    const p = db.plants.find((x) => x.id === id);
    if (p) {
      p.stock_qty = Number(stock_qty);
      p.stock_status = deriveStockStatus(p.stock_qty);
      p.updated_at = new Date().toISOString();
    }
  });
  res.json({ updated: ids.length });
});

export default router;
