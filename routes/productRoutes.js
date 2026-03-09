// productRoutes.js
import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addCommentToProduct,
  uploadImage,
  createProductWithImages,
} from "../controllers/productController.js";

import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ⚠️ Faqat adminlar yaratishi mumkin
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

router.post("/:id/comments", protect, addCommentToProduct);

// Rasm yuklash ham adminlar uchun
router.post("/upload", protect, isAdmin, upload.single("image"), uploadImage);
router.post(
  "/with-images",
  protect,
  isAdmin,
  upload.array("images", 3), // maksimal 3 ta rasm
  createProductWithImages
);  

export default router;
