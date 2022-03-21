import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    title: {
      type: String,
      minlength: [3, "Title must be three characters long"],
      trim: true,
      unique: true,
      uniqueCaseInsensitive: true,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      minlength: [3, "Description must be three characters long"],
      required: [true, "Description is required"],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default categoryModel = mongoose.model("Category", CategorySchema);
