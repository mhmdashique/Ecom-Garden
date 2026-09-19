import express from "express";
import { db } from "../utils/memoryStore.js";
import { auth, adminOnly } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import supabase, { supabaseAdmin, secretKey } from "../config/supabase.js";
const router = express.Router();
const database = supabaseAdmin || supabase;
const canUseDatabase = Boolean(
  database && secretKey && !secretKey.includes("•"),
);

router.get("/profile", auth, async (req, res) => {
  let user = db.users.find((u) => u.id === req.user.id);
  if (canUseDatabase) {
    const result = await database
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();
    if (!result.error && result.data) user = result.data;
  }
  if (!user) return res.status(404).json({ error: "User not found" });
  let addresses = db.addresses.filter((a) => a.user_id === req.user.id);
  if (canUseDatabase) {
    try {
      const { data, error } = await database.from("addresses").select("*").eq("user_id", req.user.id).order("is_default", { ascending: false });
      if (!error && Array.isArray(data)) {
        // keep label from memory if exists, else use DB row
        addresses = data.length ? data : addresses;
        // merge: if memory has newer non-persisted addresses (short ids), append them
        const dbIds = new Set(data.map(d=>d.id));
        const memOnly = db.addresses.filter(a=>a.user_id===req.user.id && !dbIds.has(a.id));
        if (memOnly.length) addresses = [...addresses, ...memOnly];
      }
    } catch {}
  }
  res.json({ ...user, password_hash: undefined, addresses });
});
router.put("/profile", auth, async (req, res) => {
  const patch = {};
  if (req.body.name?.trim()) patch.name = req.body.name.trim();
  if (req.body.phone !== undefined) patch.phone = String(req.body.phone).trim();
  if (req.body.email?.trim()) patch.email = req.body.email.trim().toLowerCase();
  if (!patch.name || !patch.email)
    return res.status(400).json({ error: "Name and email are required" });

  let user = db.users.find((item) => item.id === req.user.id);
  if (canUseDatabase) {
    const result = await database
      .from("users")
      .update(patch)
      .eq("id", req.user.id)
      .select("id,name,email,phone,role,email_verified,created_at")
      .single();
    if (result.error)
      return res
        .status(400)
        .json({
          error:
            result.error.code === "23505"
              ? "Email already exists"
              : "Could not update profile",
        });
    user = result.data;
  }
  if (user) Object.assign(user, patch);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ...user, password_hash: undefined });
});
router.put("/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword)
    return res.status(400).json({ error: "Current password is required" });
  if (!newPassword || newPassword.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });

  let user = db.users.find((item) => item.id === req.user.id);
  if (canUseDatabase) {
    const result = await database
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();
    if (!result.error && result.data) user = result.data;
  }
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!(await bcrypt.compare(currentPassword, user.password_hash || "")))
    return res.status(400).json({ error: "Current password is incorrect" });

  const password_hash = await bcrypt.hash(newPassword, 10);
  if (canUseDatabase && user.id === req.user.id) {
    const result = await database
      .from("users")
      .update({ password_hash })
      .eq("id", user.id)
      .select("id")
      .single();
    if (result.error)
      return res.status(500).json({ error: "Could not save password" });
  }
  const localUser = db.users.find((item) => item.id === user.id);
  if (localUser) localUser.password_hash = password_hash;
  res.json({ message: "Password updated" });
});
router.get("/", auth, adminOnly, (req, res) => {
  if (!canUseDatabase)
    return res.json(db.users.map((u) => ({ ...u, password_hash: undefined })));
  database
    .from("users")
    .select(
      "id,name,email,phone,role,email_verified,blocked,created_at",
    )
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error)
        return res.json(
          db.users.map((u) => ({ ...u, password_hash: undefined })),
        );
      res.json(data || []);
    })
    .catch(() =>
      res.json(db.users.map((u) => ({ ...u, password_hash: undefined }))),
    );
});
router.put("/:id/block", auth, adminOnly, (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  user.blocked = !user.blocked;
  res.json(user);
});
router.put("/:id", auth, adminOnly, (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { name, email, phone, role } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined && ["user", "admin"].includes(role)) user.role = role;
  user.updated_at = new Date().toISOString();
  res.json({ ...user, password_hash: undefined });
});

// addresses
router.get("/addresses", auth, async (req, res) => {
  let addresses = db.addresses.filter((a) => a.user_id === req.user.id);
  if (canUseDatabase) {
    try {
      const { data, error } = await database.from("addresses").select("*").eq("user_id", req.user.id).order("is_default", { ascending: false });
      if (!error && Array.isArray(data) && data.length) {
        const dbIds = new Set(data.map(d=>d.id));
        const memOnly = addresses.filter(a=>!dbIds.has(a.id));
        addresses = [...data, ...memOnly];
      }
    } catch {}
  }
  res.json(addresses);
});
router.post("/addresses", auth, async (req, res) => {
  const isDefault = !!req.body.is_default;
  const payload = {
    label: req.body.label || "Home",
    street: req.body.street || "",
    city: req.body.city || "",
    state: req.body.state || "",
    postal_code: req.body.postal_code || "",
    country: req.body.country || "India",
    is_default: isDefault,
  };
  // persist to Supabase when possible (user_id must be uuid for FK)
  const uuidPat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (canUseDatabase && uuidPat.test(req.user.id)) {
    try {
      if (isDefault) {
        await database.from("addresses").update({ is_default: false }).eq("user_id", req.user.id);
        db.addresses.forEach((a) => { if (a.user_id === req.user.id) a.is_default = false; });
      }
      // Supabase table has no `label` column — strip it for DB insert
      const { label, ...dbPayload } = payload;
      const { data, error } = await database.from("addresses").insert([{ user_id: req.user.id, ...dbPayload }]).select("*").single();
      if (!error && data) {
        // keep label in memory copy for UI
        const memAddr = { ...data, label: payload.label };
        db.addresses.push(memAddr);
        return res.status(201).json(memAddr);
      }
      if (error) console.warn("[addresses] supabase insert failed:", error.message);
    } catch (e) { console.warn("[addresses] supabase insert exception:", e.message); }
  }
  // fallback to memory-only (non-uuid users or DB failure)
  if (isDefault) {
    db.addresses.forEach((a) => {
      if (a.user_id === req.user.id) a.is_default = false;
    });
  }
  const addr = {
    id: Math.random().toString(36).slice(2, 9),
    user_id: req.user.id,
    ...payload,
  };
  db.addresses.push(addr);
  res.status(201).json(addr);
});
router.put("/addresses/:id", auth, async (req, res) => {
  const uuidPat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isDefault = req.body.is_default;
  // try Supabase first if id looks like uuid
  if (canUseDatabase && uuidPat.test(req.params.id) && uuidPat.test(req.user.id)) {
    try {
      if (isDefault) await database.from("addresses").update({ is_default: false }).eq("user_id", req.user.id);
      const patch = {};
      if (req.body.street !== undefined) patch.street = req.body.street;
      if (req.body.city !== undefined) patch.city = req.body.city;
      if (req.body.state !== undefined) patch.state = req.body.state;
      if (req.body.postal_code !== undefined) patch.postal_code = req.body.postal_code;
      if (req.body.country !== undefined) patch.country = req.body.country;
      if (isDefault !== undefined) patch.is_default = !!isDefault;
      const { data, error } = await database.from("addresses").update(patch).eq("id", req.params.id).eq("user_id", req.user.id).select("*").single();
      if (!error && data) {
        if (isDefault) db.addresses.forEach((a)=>{ if(a.user_id===req.user.id) a.is_default = a.id===req.params.id; });
        const mem = db.addresses.find(a=>a.id===req.params.id);
        if (mem) Object.assign(mem, data, { label: req.body.label ?? mem.label });
        const withLabel = { ...data, label: req.body.label ?? db.addresses.find(a=>a.id===req.params.id)?.label ?? "Home" };
        return res.json(withLabel);
      }
    } catch {}
  }
  const addr = db.addresses.find((a) => a.id === req.params.id && a.user_id === req.user.id);
  if (!addr) return res.status(404).json({ error: "Address not found" });
  if (isDefault) {
    db.addresses.forEach((a) => {
      if (a.user_id === req.user.id) a.is_default = false;
    });
    if (canUseDatabase && uuidPat.test(req.user.id)) {
      try { await database.from("addresses").update({ is_default: false }).eq("user_id", req.user.id); } catch {}
    }
  }
  Object.assign(addr, {
    label: req.body.label ?? addr.label,
    street: req.body.street ?? addr.street,
    city: req.body.city ?? addr.city,
    state: req.body.state ?? addr.state,
    postal_code: req.body.postal_code ?? addr.postal_code,
    country: req.body.country ?? addr.country,
    is_default: isDefault !== undefined ? !!isDefault : addr.is_default,
  });
  // also update Supabase if this was a memory-only id but user is uuid -> try to sync
  if (canUseDatabase && uuidPat.test(req.user.id) && !uuidPat.test(req.params.id)) {
    // memory id can't be updated in DB, keep memory only
  }
  res.json(addr);
});
router.delete("/addresses/:id", auth, async (req, res) => {
  const uuidPat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let deleted = false;
  if (canUseDatabase && uuidPat.test(req.params.id)) {
    try {
      const { error } = await database.from("addresses").delete().eq("id", req.params.id).eq("user_id", req.user.id);
      if (!error) deleted = true;
      else console.warn("[addresses] supabase delete failed:", error.message);
      // always clean memory copy
      const idx2 = db.addresses.findIndex(a=>a.id===req.params.id);
      if (idx2!==-1) { db.addresses.splice(idx2,1); deleted = true; }
      if (deleted) return res.json({ ok: true });
    } catch (e) { console.warn("[addresses] supabase delete exception:", e.message); }
  }
  const idx = db.addresses.findIndex((a) => a.id === req.params.id && a.user_id === req.user.id);
  if (idx !== -1) { db.addresses.splice(idx, 1); return res.json({ ok: true }); }
  // fallback: id exists but user_id mismatch (stale memory) — allow delete by id alone
  const idxAny = db.addresses.findIndex(a => a.id === req.params.id);
  if (idxAny !== -1) { db.addresses.splice(idxAny, 1); return res.json({ ok: true }); }
  if (deleted) return res.json({ ok: true });
  return res.status(404).json({ error: "Address not found" });
});
router.put("/addresses/:id/default", auth, async (req, res) => {
  const uuidPat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (canUseDatabase && uuidPat.test(req.params.id) && uuidPat.test(req.user.id)) {
    try {
      await database.from("addresses").update({ is_default: false }).eq("user_id", req.user.id);
      const { data, error } = await database.from("addresses").update({ is_default: true }).eq("id", req.params.id).eq("user_id", req.user.id).select("*").single();
      if (!error && data) {
        db.addresses.forEach((a) => { if (a.user_id === req.user.id) a.is_default = a.id === req.params.id; });
        const mem = db.addresses.find(a=>a.id===req.params.id);
        if (mem) mem.is_default = true;
        return res.json({ ...data, label: mem?.label ?? "Home" });
      }
    } catch {}
  }
  const addr = db.addresses.find((a) => a.id === req.params.id && a.user_id === req.user.id);
  if (!addr) return res.status(404).json({ error: "Address not found" });
  db.addresses.forEach((a) => {
    if (a.user_id === req.user.id) a.is_default = a.id === addr.id;
  });
  if (canUseDatabase && uuidPat.test(req.user.id)) {
    try {
      await database.from("addresses").update({ is_default: false }).eq("user_id", req.user.id);
      if (uuidPat.test(req.params.id)) await database.from("addresses").update({ is_default: true }).eq("id", req.params.id);
    } catch {}
  }
  res.json(addr);
});

// single customer detail for admin - must be after /addresses to avoid shadowing
router.get("/:id", auth, adminOnly, async (req, res) => {
  const id = req.params.id;
  if (["addresses", "profile", "password"].includes(id)) return res.status(404).json({ error: "Not found" });
  let user = db.users.find((u) => u.id === id);
  if (canUseDatabase) {
    const { data, error } = await database
      .from("users")
      .select("id,name,email,phone,role,email_verified,blocked,created_at")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) user = data;
  }
  if (!user) return res.status(404).json({ error: "Customer not found" });
  const { password_hash, ...safeUser } = user;
  let orders = db.orders.filter((o) => o.user_id === id);
  if (canUseDatabase) {
    try {
      const { data } = await database
        .from("orders")
        .select("id,total_amount,status,payment_status,payment_method,created_at,address_id")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      if (data && data.length) {
        const addressIds = [...new Set(data.map((o) => o.address_id).filter(Boolean))];
        let addressMap = new Map();
        if (addressIds.length) {
          const { data: addrs } = await database.from("addresses").select("id,street,city,state,postal_code,country").in("id", addressIds);
          (addrs || []).forEach((a) => addressMap.set(a.id, a));
        }
        const ids = data.map((o) => o.id);
        let itemMap = new Map();
        if (ids.length) {
          const { data: items } = await database.from("order_items").select("order_id,plant_id,quantity,price_at_purchase").in("order_id", ids);
          (items || []).forEach((it) => {
            if (!itemMap.has(it.order_id)) itemMap.set(it.order_id, []);
            itemMap.get(it.order_id).push({ plant_id: it.plant_id, quantity: it.quantity, price: it.price_at_purchase });
          });
        }
        orders = data.map((o) => ({ ...o, address: addressMap.get(o.address_id) || null, items: itemMap.get(o.id) || [] }));
      }
    } catch {}
  }
  let addresses = db.addresses.filter((a) => a.user_id === id);
  if (canUseDatabase) {
    try {
      const { data } = await database.from("addresses").select("*").eq("user_id", id);
      if (data && data.length) addresses = data;
    } catch {}
  }
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  res.json({ ...safeUser, addresses, orders, totalOrders, totalSpent });
});

export default router;
