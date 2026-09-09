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
  const addresses = db.addresses.filter((a) => a.user_id === req.user.id);
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
      "id,name,email,phone,role,email_verified,blocked,created_at,updated_at",
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
router.get("/addresses", auth, (req, res) => {
  res.json(db.addresses.filter((a) => a.user_id === req.user.id));
});
router.post("/addresses", auth, (req, res) => {
  const addr = {
    id: Math.random().toString(36).slice(2, 9),
    user_id: req.user.id,
    ...req.body,
    is_default: false,
  };
  db.addresses.push(addr);
  res.status(201).json(addr);
});

export default router;
