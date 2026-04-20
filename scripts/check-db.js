import dotenv from "dotenv";
import mongoose from "mongoose";

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

  console.log("MongoDB connection check passed.");
  process.exit(0);
} catch (err) {
  console.error("MongoDB connection check failed.");
  console.error(err.message);

  const serverErrors = err?.reason?.servers;
  if (serverErrors instanceof Map) {
    for (const [address, description] of serverErrors.entries()) {
      const detail = description?.error?.message || description?.type;
      console.error(`${address} -> ${detail}`);
    }
  }

  process.exit(1);
} finally {
  await mongoose.disconnect().catch(() => {});
}
