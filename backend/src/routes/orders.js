import express from "express";
import { db, genId, genOrderId } from "../utils/memoryStore.js";
import { auth, adminOnly } from "../middleware/auth.js";
import supabase, { supabaseAdmin, secretKey } from "../config/supabase.js";
const router = express.Router();
const database = supabaseAdmin || supabase;
const canUseDatabase = Boolean(
  database && secretKey && !secretKey.includes("•"),
);
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function hydrateOrders(rows) {
  if (!rows?.length) return [];
  const ids = rows.map((order) => order.id);
  const userIds = [
    ...new Set(rows.map((order) => order.user_id).filter(Boolean)),
  ];
  const addressIds = [
    ...new Set(rows.map((order) => order.address_id).filter(Boolean)),
  ];
  const [{ data: itemRows }, { data: users }, { data: addresses }] =
    await Promise.all([
      database
        .from("order_items")
        .select("order_id,plant_id,quantity,price_at_purchase")
        .in("order_id", ids),
      userIds.length
        ? database.from("users").select("id,name,email,phone").in("id", userIds)
        : Promise.resolve({ data: [] }),
      addressIds.length
        ? database
            .from("addresses")
            .select("id,street,city,state,postal_code,country")
            .in("id", addressIds)
        : Promise.resolve({ data: [] }),
    ]);
  const userMap = new Map((users || []).map((user) => [user.id, user]));
  const addressMap = new Map(
    (addresses || []).map((address) => [address.id, address]),
  );
  const itemMap = new Map();
  (itemRows || []).forEach((item) => {
    if (!itemMap.has(item.order_id)) itemMap.set(item.order_id, []);
    itemMap.get(item.order_id).push({
      plant_id: item.plant_id,
      quantity: item.quantity,
      price: item.price_at_purchase,
    });
  });
  return rows.map((order) => ({
    ...order,
    user_name: userMap.get(order.user_id)?.name || order.user_name,
    user_email: userMap.get(order.user_id)?.email || order.user_email,
    customer_name:
      userMap.get(order.user_id)?.name || order.user_name || "Customer",
    customer_email: userMap.get(order.user_id)?.email || order.user_email || "",
    customer_phone:
      order.customer_phone || userMap.get(order.user_id)?.phone || "",
    address: order.address || addressMap.get(order.address_id) || null,
    items: itemMap.get(order.id)?.length
      ? itemMap.get(order.id)
      : (order.items || []),
  }));
}

router.post("/", auth, async (req, res) => {
  const { address, items, total, payment_method, note, customer_phone } =
    req.body;
  if (!items || !items.length)
    return res.status(400).json({ error: "No items" });
  // Every order carries the fixed delivery charge; wholesale only changes item prices.
  const SHIPPING_FEE = 49;
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0,
  );
  const shipping = SHIPPING_FEE;
  const computedTotal = Math.round((subtotal + shipping) * 100) / 100;
  // use server-computed total, ignore tampered client total if differs >1
  const finalTotal =
    total && Math.abs(Number(total) - computedTotal) < 1
      ? Number(total)
      : computedTotal;
  const order = {
    id: genOrderId(),
    user_id: req.user.id,
    user_name: req.user.name,
    user_email: req.user.email,
    address,
    items,
    subtotal,
    shipping,
    total_amount: finalTotal,
    payment_method: payment_method || "COD",
    payment_status: "pending",
    note: note || "",
    customer_phone: customer_phone || "",
    status: "pending_owner",
    owner_notified: true,
    owner_notified_at: new Date().toISOString(),
    owner_reply: null,
    owner_replied_at: null,
    created_at: new Date().toISOString(),
  };
  if (canUseDatabase && uuidPattern.test(req.user.id)) {
    let addressId = null;
    if (address?.street && uuidPattern.test(req.user.id)) {
      const addressResult = await database
        .from("addresses")
        .insert([{ user_id: req.user.id, ...address, is_default: false }])
        .select("id")
        .single();
      if (!addressResult.error) addressId = addressResult.data.id;
    }
    const orderResult = await database
      .from("orders")
      .insert([
        {
          user_id: req.user.id,
          address_id: addressId,
          subtotal,
          shipping,
          total_amount: finalTotal,
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          note: order.note,
          customer_phone: order.customer_phone,
        },
      ])
      .select()
      .single();
    if (!orderResult.error) {
      const storedOrder = {
        ...order,
        id: orderResult.data.id,
        address_id: addressId,
      };
      await database.from("order_items").insert(
        items.map((item) => ({
          order_id: storedOrder.id,
          plant_id: uuidPattern.test(item.plant_id) ? item.plant_id : null,
          quantity: Number(item.quantity) || 0,
          price_at_purchase: Number(item.price) || 0,
        })),
      );
      db.orders.push(storedOrder);
      return res.status(201).json(storedOrder);
    }
  }
  db.orders.push(order);
  // decrement stock mock
  items.forEach((it) => {
    const p = db.plants.find((x) => x.id === it.plant_id);
    if (p) p.stock_qty = Math.max(0, p.stock_qty - it.quantity);
  });
  // Mock: send notification to owner's mobile (log)
  console.log(
    `[OWNER NOTIFY] New order #${order.id} from ${order.user_name} (${order.user_email}) - ₹${order.total_amount} (subtotal ₹${subtotal}+shipping ₹${shipping}) - COD. WhatsApp to owner: +91 98765 43210`,
  );
  res.status(201).json(order);
});

router.get("/my", auth, (req, res) => {
  if (!canUseDatabase || !uuidPattern.test(req.user.id))
    return res.json(db.orders.filter((o) => o.user_id === req.user.id));
  database
    .from("orders")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .then(async ({ data, error }) =>
      res.json(
        error
          ? db.orders.filter((o) => o.user_id === req.user.id)
          : await hydrateOrders(data || []),
      ),
    )
    .catch(() => res.json(db.orders.filter((o) => o.user_id === req.user.id)));
});

router.get("/", auth, adminOnly, (req, res) => {
  if (!canUseDatabase) return res.json(db.orders);
  database
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .then(async ({ data, error }) =>
      res.json(error ? db.orders : await hydrateOrders(data || [])),
    )
    .catch(() => res.json(db.orders));
});

router.put("/:id/status", auth, adminOnly, async (req, res) => {
  const localOrder = db.orders.find((item) => item.id === req.params.id);
  const patch = {};
  if (req.body.status) patch.status = req.body.status;
  if (req.body.payment_status) patch.payment_status = req.body.payment_status;
  const localPatch = { ...patch };
  if (req.body.cancel_reason) {
    localPatch.cancel_reason = req.body.cancel_reason;
    localPatch.cancelled_at = new Date().toISOString();
  }
  if (!Object.keys(patch).length)
    return res.status(400).json({ error: "No status changes supplied" });

  if (canUseDatabase && uuidPattern.test(req.params.id)) {
    const { data, error } = await database
      .from("orders")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .single();
    if (!error && data) {
      if (localOrder) Object.assign(localOrder, data, localPatch);
      return res.json(data);
    }
    if (error && !localOrder)
      return res.status(404).json({ error: "Order not found in database" });
  }

  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  Object.assign(order, localPatch);
  res.json(order);
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  const {
    address,
    customer_phone,
    items,
    total_amount,
    payment_method,
    payment_status,
    note,
    customer_name,
    customer_email,
  } = req.body;
  const patch = {};
  if (address !== undefined) patch.address = address;
  if (customer_phone !== undefined) patch.customer_phone = customer_phone;
  if (customer_name !== undefined) patch.user_name = customer_name;
  if (customer_email !== undefined) patch.user_email = customer_email;
  if (items !== undefined) patch.items = items;
  if (total_amount !== undefined) patch.total_amount = Number(total_amount);
  if (payment_method !== undefined) patch.payment_method = payment_method;
  if (payment_status !== undefined) patch.payment_status = payment_status;
  if (note !== undefined) patch.note = note;

  if (canUseDatabase && uuidPattern.test(req.params.id)) {
    const { data, error } = await database
      .from("orders")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .single();
    if (!error && data) {
      if (order) Object.assign(order, data);
      return res.json(data);
    }
    if (error && !order)
      return res.status(404).json({ error: "Order not found in database" });
  }
  if (!order) return res.status(404).json({ error: "Not found" });
  if (address !== undefined) order.address = address;
  if (customer_phone !== undefined) order.customer_phone = customer_phone;
  if (customer_name !== undefined) order.user_name = customer_name;
  if (customer_email !== undefined) order.user_email = customer_email;
  if (items !== undefined) order.items = items;
  if (total_amount !== undefined) order.total_amount = Number(total_amount);
  if (payment_method !== undefined) order.payment_method = payment_method;
  if (payment_status !== undefined) order.payment_status = payment_status;
  if (note !== undefined) order.note = note;
  order.updated_at = new Date().toISOString();
  res.json(order);
});

// User cancel own order — reason mandatory
router.put("/:id/cancel", auth, async (req, res) => {
  let order = db.orders.find((o) => o.id === req.params.id);
  if (!order && canUseDatabase && uuidPattern.test(req.params.id)) {
    const result = await database
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (!result.error) order = result.data;
  }
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.user_id !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ error: "Not your order" });
  if (
    !["pending", "pending_owner", "processing", "confirmed"].includes(
      order.status,
    )
  )
    return res.status(400).json({ error: "Cannot cancel this order now" });
  const reason = (req.body.reason || "").trim();
  if (!reason || reason.length < 6)
    return res
      .status(400)
      .json({ error: "Cancel reason is mandatory (min 6 chars)" });
  order.status = "cancelled";
  order.cancel_reason = reason;
  order.cancelled_at = new Date().toISOString();
  order.cancelled_by = req.user.id;
  if (canUseDatabase && uuidPattern.test(req.params.id)) {
    const result = await database
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", req.params.id)
      .select()
      .single();
    if (result.error)
      return res.status(500).json({ error: "Could not save cancellation" });
    Object.assign(order, result.data);
  }
  console.log(
    `[CANCEL] Order #${order.id} by ${req.user.email} reason: ${reason}`,
  );
  res.json(order);
});

// Owner reply endpoint - admin confirms/ replies
router.put("/:id/reply", auth, adminOnly, async (req, res) => {
  let order = db.orders.find((o) => o.id === req.params.id);
  if (!order && canUseDatabase && uuidPattern.test(req.params.id)) {
    const result = await database
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (!result.error) order = result.data;
  }
  if (!order) return res.status(404).json({ error: "Not found" });
  order.owner_reply =
    req.body.message ||
    "Thank you for your order! We will contact you soon to confirm delivery.";
  order.owner_replied_at = new Date().toISOString();
  order.status = "confirmed";
  order.payment_status = "confirmed";
  if (canUseDatabase && uuidPattern.test(req.params.id)) {
    const result = await database
      .from("orders")
      .update({
        owner_reply: order.owner_reply,
        status: "confirmed",
        payment_status: "confirmed",
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (result.error)
      return res.status(500).json({ error: "Could not save owner reply" });
    Object.assign(order, result.data);
  }
  console.log(`[OWNER REPLY] Order #${order.id} replied: ${order.owner_reply}`);
  res.json(order);
});

export default router;
