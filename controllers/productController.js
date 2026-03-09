import Product from "../models/Product.js";
import { cloudinary } from "../middleware/upload.js";

// --- 1. Barcha productlarni filtr bilan olish ---
export async function getAllProducts(req, res) {
  try {
    const { type, category, minPrice, maxPrice, colors, size } = req.query;

    let filter = {};

    if (type) {
      const types = type.split(",");
      filter.type = { $in: types };
    }
    if (category) {
      const categories = category.split(",");
      filter.category = { $in: categories };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (colors) {
      const colorArray = colors.split(",");
      filter.colors = { $in: colorArray };
    }
    if (size) {
      const sizeArray = size.split(",");
      filter.size = { $in: sizeArray };
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 2. ID bo‘yicha product olish ---
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 3. Yangi product yaratish (faqat ma'lumotlar bilan, rasm yo‘q) ---
export async function createProduct(req, res) {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 4. Productni yangilash ---
export async function updateProduct(req, res) {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 5. Productni o‘chirish ---
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    // Rasmlarni Cloudinary dan o’chirish
    if (product.images && Array.isArray(product.images)) {
      for (const imageUrl of product.images) {
        try {
          // URL dan public_id ni ajratib olish
          const parts = imageUrl.split("/");
          const filename = parts[parts.length - 1].split(".")[0];
          const folder = parts[parts.length - 2];
          const publicId = `${folder}/${filename}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary rasm o’chirishda xatolik:", err.message);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Mahsulot va rasm o‘chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 6. Productga comment qo‘shish ---
export async function addCommentToProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userName = `${req.user.firstName} ${req.user.lastName}`.trim();

    const comment = {
      user: userName,
      userRate: req.body.userRate,
      posted: new Date().toISOString(),
      comment: req.body.comment,
    };

    product.comments.push(comment);
    await product.save();

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- 7. Rasmni alohida yuklash (multer bilan) ---
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image not uploaded" });
  }

  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl });
};

// --- 8. Yangi product yaratish (multer bilan rasm + ma'lumot birga) ---
export async function createProductWithImages(req, res) {
  try {
    // Fayl yuklanmagan bo‘lsa
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Rasmlar yuklanmagan" });
    }

    // Cloudinary URL larini olish
    const imageUrls = req.files.map((file) => file.path);

    // Product ma'lumotlarini yig‘ish
    const productData = {
      ...req.body,
      images: imageUrls, // array ko‘rinishida
      colors: req.body.colors ? req.body.colors.split(",") : [],
      size: req.body.size ? req.body.size.split(",") : [],
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
