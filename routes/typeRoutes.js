import express from "express";
import {
  createType,
  getAllTypes,
  deleteType,
} from "../controllers/typeController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👇 Front-end uchun: barcha turlar
router.get("/", getAllTypes);

// 👇 Admin uchun
router.post("/", protect, isAdmin, createType);
router.delete("/:id", protect, isAdmin, deleteType);

export default router;
