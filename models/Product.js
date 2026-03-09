import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: String,
  userRate: Number,
  posted: String,
  comment: String,
});

const productSchema = new mongoose.Schema({
  title: String,
  images: [String],
  rating: Number,
  price: Number,
  category: String,
  about: String,
  discount: Number,
  colors: [String],
  size: [String],
  type: String,
  comments: [commentSchema],
});

export default mongoose.model("Product", productSchema);
