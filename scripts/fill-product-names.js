import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI?.trim();

if (!mongoUri) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });

  const products = await Product.find({
    $or: [
      { name: { $exists: false } },
      { name: null },
      { name: "" },
    ],
    title: { $exists: true, $ne: null },
  }).select("_id title name");

  if (products.length === 0) {
    console.log("No products need name backfill.");
    process.exit(0);
  }

  const operations = products
    .map((product) => {
      const normalizedName =
        typeof product.title === "string" ? product.title.trim() : "";

      if (!normalizedName) return null;

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              name: normalizedName,
            },
          },
        },
      };
    })
    .filter(Boolean);

  if (operations.length === 0) {
    console.log("No products with usable title found for backfill.");
    process.exit(0);
  }

  const result = await Product.bulkWrite(operations);

  console.log(`Matched products: ${products.length}`);
  console.log(`Updated products: ${result.modifiedCount}`);
  process.exit(0);
} catch (err) {
  console.error("Product name backfill failed.");
  console.error(err.message);
  process.exit(1);
} finally {
  await mongoose.disconnect().catch(() => {});
}
