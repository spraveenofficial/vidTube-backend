import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
      // Add timestamp to each video object
      timestamps: true,
    },
  ],
});

const History = mongoose.model("History", HistorySchema);

export default History;
