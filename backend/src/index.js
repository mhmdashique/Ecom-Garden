import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { db, genId } from "./utils/memoryStore.js";
import { auth } from "./middleware/auth.js";
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
  res.json({ ok: true, time: new Date().toISOString() }),
);

const __dirname = path.resolve();
const FRONTEND_DIST = path.join(__dirname, "../frontend/dist");

app.use(express.static(FRONTEND_DIST));

app.get("/", (req, res) =>
  res.type("html").send(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f6f7f4;color:#0a2e1f"><div style="text-align:center"><h1>🌿 Verdant API</h1><p style="color:#666">Backend is running. Open the frontend at <a href="http://localhost:5173">http://localhost:5173</a></p></div></body></html>`
  )
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/wishlist", auth, (req, res) =>
  res.json(db.wishlist.filter((w) => w.user_id === req.user.id)),
);
app.post("/api/wishlist", auth, (req, res) => {
  const exists = db.wishlist.find(
    (w) => w.user_id === req.user.id && w.plant_id === req.body.plant_id,
  );
  if (exists) return res.json(exists);
  const item = {
    id: genId(),
    user_id: req.user.id,
    plant_id: req.body.plant_id,
  };
  db.wishlist.push(item);
  res.status(201).json(item);
});
app.delete("/api/wishlist/:id", auth, (req, res) => {
  const idx = db.wishlist.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.wishlist.splice(idx, 1);
  res.json({ message: "removed" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const server = app.listen(PORT, HOST, () =>
  console.log(`Backend running on http://${HOST}:${PORT} — health: http://${HOST}:${PORT}/api/health`),
);

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
