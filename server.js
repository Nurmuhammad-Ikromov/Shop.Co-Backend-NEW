import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import typeRoutes from "./routes/typeRoutes.js";

import multer from "multer";
import path from "path";

dotenv.config();

const app = express();

// --- Multer sozlash ---
// uploads papkasi va fayl nomini sozlaymiz
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // uploads papkasi
  },
  filename: function (req, file, cb) {
    // Original nom oldidan vaqt qo‘shamiz (unique bo‘lsin uchun)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Static files uchun — uploads papkasi ochiq bo‘lsin
app.use("/uploads", express.static("uploads"));

// Routesga multer ni qanday kiritish masalasi productRoutes’da bo‘ladi.
// Shu sababli bu yerda multer middleware kiritilmaydi

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/types", typeRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((err) => console.log(err));
