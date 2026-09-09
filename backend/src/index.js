import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

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
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get("/api/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() }),
);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

// wishlist simple
import { db, genId } from "./utils/memoryStore.js";
import { auth } from "./middleware/auth.js";
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
  if (idx !== -1) db.wishlist.splice(idx, 1);
  res.json({ message: "removed" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`),
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
