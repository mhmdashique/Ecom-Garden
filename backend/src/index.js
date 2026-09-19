import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { db, genId } from "./utils/memoryStore.js";
import { auth } from "./middleware/auth.js";
import supabase, { supabaseAdmin, secretKey } from "./config/supabase.js";
import authRoutes from "./routes/auth.js";
import plantRoutes from "./routes/plants.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: function(origin, cb){
    if(!origin) return cb(null, true);
    if(allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return cb(null, true);
    if(origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("devtunnels.ms") || origin.includes("inc1.devtunnels.ms")) return cb(null, true);
    for(const pat of allowedOrigins){
      if(pat.includes("*") && new RegExp("^"+pat.replace(/\*/g,".*")+"$").test(origin)) return cb(null, true);
    }
    return cb(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
}));
app.use(express.json());
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get("/api/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString(), host: req.get("host") }),
);
app.get("/api", (req,res)=> res.json({ ok:true, message:"Shaji’s Nursery and Gardens API — use /api/health, /api/plants, /api/orders", docs:"/api/health" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

const wishlistDb = supabaseAdmin || supabase;
const canUseWishlistDb = Boolean(wishlistDb && secretKey && !secretKey.includes("•"));
const uuidPat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

app.get("/api/wishlist", auth, async (req, res) => {
  const mem = db.wishlist.filter((w) => w.user_id === req.user.id);
  if (!canUseWishlistDb || !uuidPat.test(req.user.id)) return res.json(mem);
  try {
    const { data, error } = await wishlistDb.from("wishlist").select("*").eq("user_id", req.user.id);
    if (error) return res.json(mem);
    // merge Supabase + memory-only (short-id) items
    const dbIds = new Set((data||[]).map(d=>d.id));
    const memOnly = mem.filter(m=>!dbIds.has(m.id));
    return res.json([...(data||[]), ...memOnly]);
  } catch { return res.json(mem); }
});
app.post("/api/wishlist", auth, async (req, res) => {
  const plant_id = req.body.plant_id;
  if (!plant_id) return res.status(400).json({ error: "plant_id required" });
  const exists = db.wishlist.find((w) => w.user_id === req.user.id && w.plant_id === plant_id);
  if (exists) return res.json(exists);
  // try Supabase if uuid user + uuid plant
  if (canUseWishlistDb && uuidPat.test(req.user.id) && uuidPat.test(String(plant_id))) {
    try {
      const { data: existing } = await wishlistDb.from("wishlist").select("*").eq("user_id", req.user.id).eq("plant_id", plant_id).maybeSingle();
      if (existing) {
        // keep memory in sync
        if (!exists) db.wishlist.push(existing);
        return res.json(existing);
      }
      const { data, error } = await wishlistDb.from("wishlist").insert([{ user_id: req.user.id, plant_id }]).select("*").single();
      if (!error && data) {
        db.wishlist.push(data);
        return res.status(201).json(data);
      }
      if (error) console.warn("[wishlist] supabase insert failed:", error.message);
    } catch (e) { console.warn("[wishlist] supabase insert exception:", e.message); }
  }
  const item = { id: genId(), user_id: req.user.id, plant_id };
  db.wishlist.push(item);
  res.status(201).json(item);
});
app.delete("/api/wishlist/:id", auth, async (req, res) => {
  const id = req.params.id;
  // try Supabase if id is uuid
  if (canUseWishlistDb && uuidPat.test(String(id))) {
    try {
      const { error, count } = await wishlistDb.from("wishlist").delete().eq("id", id).eq("user_id", req.user.id).select();
      // also clean memory
      const idx2 = db.wishlist.findIndex((w) => w.id === id);
      if (idx2 !== -1) db.wishlist.splice(idx2, 1);
      if (!error) return res.json({ message: "removed" });
    } catch {}
  }
  const idx = db.wishlist.findIndex((w) => w.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  // ensure ownership
  if (db.wishlist[idx].user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  db.wishlist.splice(idx, 1);
  res.json({ message: "removed" });
});
// also allow delete by plant_id for convenience
app.delete("/api/wishlist/by-plant/:plant_id", auth, async (req, res) => {
  const plant_id = req.params.plant_id;
  const memIdx = db.wishlist.findIndex((w) => w.user_id === req.user.id && w.plant_id === plant_id);
  if (canUseWishlistDb && uuidPat.test(req.user.id) && uuidPat.test(String(plant_id))) {
    try {
      await wishlistDb.from("wishlist").delete().eq("user_id", req.user.id).eq("plant_id", plant_id);
    } catch {}
  }
  if (memIdx !== -1) db.wishlist.splice(memIdx, 1);
  res.json({ message: "removed" });
});

// serve frontend static files if built
import fs from "fs";
const __dirname = path.resolve();
const FRONTEND_DIST = path.join(__dirname, "../frontend/dist");
if(fs.existsSync(FRONTEND_DIST)){
  app.use(express.static(FRONTEND_DIST));
  // SPA fallback — serve index.html for non-api routes
  app.get("*", (req, res, next)=>{
    if(req.path.startsWith("/api")) return next();
    const index = path.join(FRONTEND_DIST, "index.html");
    if(fs.existsSync(index)) return res.sendFile(index);
    return next();
  });
} else {
  app.get("/", (req, res) =>
    res.type("html").send(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f6f7f4;color:#0a2e1f"><div style="text-align:center;max-width:560px;padding:24px"><h1>🌿 Shaji's Nursery and Gardens API</h1><p style="color:#666">Backend is running.</p><p><a href="/api/health" style="color:#0a2e1f;font-weight:700">/api/health</a></p></div></body></html>`
    )
  );
}

export default app;

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
let server;
if(!process.env.VERCEL){
  server = app.listen(PORT, HOST, () =>
    console.log(`Backend running on http://${HOST}:${PORT} — health: http://${HOST}:${PORT}/api/health`),
  );
}

if(server){
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing backend before starting another one.`,
      );
      process.exitCode = 0;
      return;
    }
    throw error;
  });
}
