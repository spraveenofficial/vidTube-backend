import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FeelingSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: [true, "Type is required either like or dislike"],
    },
    videoId: {
      type: mongoose.Schema.ObjectId,
      ref: "Video",
      required: [true, "Video id is required"],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FeelingModel = mongoose.model("Feeling", FeelingSchema);

export default FeelingModel;
