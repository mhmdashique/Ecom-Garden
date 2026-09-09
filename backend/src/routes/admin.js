import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, genId } from "../utils/memoryStore.js";
import supabase, { supabaseAdmin, secretKey } from "../config/supabase.js";
import { auth, adminOnly } from "../middleware/auth.js";
const router = express.Router();
const database = supabaseAdmin || supabase;
const canUseDatabase = Boolean(
  database && secretKey && !secretKey.includes("•"),
);

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  let user;
  if (canUseDatabase) {
    try {
      const { data, error } = await database
        .from("users")
        .select("*")
        .eq("email", email)
        .in("role", ["admin", "super-admin"])
        .maybeSingle();
      if (!error && data) user = data;
    } catch (e) {
      console.error("[admin] supabase login lookup failed:", e.message);
    }
  }
  if (!user) {
    user = db.users.find(
      (u) =>
        u.email === email && (u.role === "admin" || u.role === "super-admin"),
    );
  }
  if (!user)
    return res.status(401).json({ error: "Invalid admin credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid admin credentials" });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" },
  );
  // record login
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const log = { id: genId(), user_id: user.id, name: user.name, email: user.email, role: user.role, ip, logged_in_at: new Date().toISOString() };
  db.login_logs.unshift(log);
  if (db.login_logs.length > 200) db.login_logs.length = 200;
  if (canUseDatabase) {
    database.from("login_logs").insert(log).then(() => {}).catch(() => {});
  }
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get("/stats", (req, res) => {
  const memoryStats = () => ({
    totalOrders: db.orders.length,
    totalUsers: db.users.filter((u) => u.role === "user").length,
    totalSales: db.orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    lowStock: db.plants.filter((p) => p.stock_qty < 10),
  });

  if (!canUseDatabase) return res.json(memoryStats());
  Promise.all([
    database.from("orders").select("total_amount", { count: "exact" }),
    database.from("users").select("id", { count: "exact" }).eq("role", "user"),
    database.from("plants").select("*").lt("stock_qty", 10),
  ])
    .then(([ordersResult, usersResult, plantsResult]) => {
      if (ordersResult.error || usersResult.error || plantsResult.error)
        return res.json(memoryStats());
      res.json({
        totalOrders: ordersResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalSales: (ordersResult.data || []).reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0,
        ),
        lowStock: plantsResult.data || [],
      });
    })
    .catch(() => res.json(memoryStats()));
});

router.get("/login-logs", auth, adminOnly, async (req, res) => {
  if (canUseDatabase) {
    try {
      const { data, error } = await database
        .from("login_logs")
        .select("*")
        .order("logged_in_at", { ascending: false })
        .limit(100);
      if (!error && data) return res.json(data);
    } catch (e) {}
  }
  res.json(db.login_logs.slice(0, 100));
});

export default router;
