import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: String,
  userRate: Number,
  posted: String,
  comment: String,
});

const productSchema = new mongoose.Schema(
  {
    name: String,
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
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.name = ret.name || ret.title || null;
        ret.title = ret.title || ret.name || null;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

export default mongoose.model("Product", productSchema);
