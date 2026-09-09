import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, genId } from "../utils/memoryStore.js";
import supabase, { supabaseAdmin, secretKey } from "../config/supabase.js";
import { notifyLogin, notifyRegistration } from "../utils/mailer.js";

const router = express.Router();

const sign = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
      name: user.name,
    },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
const database = supabaseAdmin || supabase;
const canUseDatabase = Boolean(
  database && secretKey && !secretKey.includes("•"),
);
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
});

async function findDatabaseUser(email) {
  if (!canUseDatabase) return null;
  const { data, error } = await database
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });
  let existing;
  try {
    existing = await findDatabaseUser(email);
  } catch (error) {
    console.warn("[auth] user lookup failed:", error.message);
  }
  if (existing || db.users.find((u) => u.email === email))
    return res.status(400).json({ error: "Email already exists" });
  const hash = await bcrypt.hash(password, 10);
  let user = {
    id: genId(),
    name,
    email,
    password_hash: hash,
    phone: phone || "",
    role: "user",
    email_verified: true,
    created_at: new Date().toISOString(),
  };
  if (canUseDatabase) {
    const { data, error } = await database
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: hash,
          phone: phone || "",
          role: "user",
          email_verified: true,
        },
      ])
      .select()
      .single();
    if (error)
      return res.status(500).json({ error: "Unable to create account" });
    user = data;
  }
  db.users.push(user);
  if (address) {
    db.addresses.push({
      id: genId(),
      user_id: user.id,
      ...address,
      is_default: true,
    });
  }
  // try supabase
  if (supabase && !canUseDatabase) {
    // best effort - ignore errors
    try {
      await supabase.from("users").insert([{ ...user }]);
    } catch {}
  }
  const token = sign(user);
  notifyRegistration({ name: user.name, email: user.email }).catch((error) =>
    console.warn("[mail] registration notification failed:", error.message),
  );
  res.json({ token, user: publicUser(user) });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await findDatabaseUser(email);
  } catch (error) {
    console.warn("[auth] user lookup failed:", error.message);
  }
  if (!user) user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  // handle dummy admin hash - allow password 'admin123' for seeded admin
  let ok = false;
  if (user.password_hash.includes("DUMMY")) {
    ok = password === "admin123" || password === "password123";
  } else {
    ok = await bcrypt.compare(password, user.password_hash);
  }
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  if (user.blocked) return res.status(403).json({ error: "Account blocked" });
  const token = sign(user);
  // record login
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const log = { id: genId(), user_id: user.id, name: user.name, email: user.email, role: user.role || "user", ip, logged_in_at: new Date().toISOString() };
  db.login_logs.unshift(log);
  if (db.login_logs.length > 200) db.login_logs.length = 200;
  if (canUseDatabase) {
    database.from("login_logs").insert(log).then(() => {}).catch(() => {});
  }
  if (user.role !== "admin" && user.role !== "super-admin") {
    notifyLogin(user, req).catch((error) =>
      console.warn("[mail] login notification failed:", error.message),
    );
  }
  res.json({ token, user: publicUser(user) });
});

// VERIFY EMAIL (mock)
router.get("/verify-email", (req, res) =>
  res.json({ message: "Email verified (mock)" }),
);
router.post("/forgot-password", (req, res) =>
  res.json({ message: "Reset link sent if email exists (mock)" }),
);
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6)
    return res.status(400).json({
      error: "Email and a password of at least 6 characters are required",
    });
  let user;
  try {
    user = await findDatabaseUser(email);
  } catch (error) {
    console.warn("[auth] reset lookup failed:", error.message);
  }
  if (!user) user = db.users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });
  const password_hash = await bcrypt.hash(newPassword, 10);
  if (canUseDatabase) {
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

export default router;
