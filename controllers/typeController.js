import ProductType from "../models/ProductType.js";

// 🔸 Barcha turlarni olish
export const getAllTypes = async (req, res) => {
  try {
    const types = await ProductType.find().sort({ createdAt: -1 });
    res.json(types);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Turlarni olishda xatolik", error: err.message });
  }
};

// 🔸 Yangi tur qo‘shish (faqat admin)
export const createType = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Type nomi majburiy" });

  try {
    const existing = await ProductType.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Bu tur avval qo‘shilgan" });

    const newType = await ProductType.create({ name });
    res.status(201).json(newType);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Type qo‘shishda xatolik", error: err.message });
  }
};

// 🔸 Tur o‘chirish (admin uchun)
export const deleteType = async (req, res) => {
  try {
    await ProductType.findByIdAndDelete(req.params.id);
    res.json({ message: "Type o‘chirildi" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Type o‘chirishda xatolik", error: err.message });
  }
};
