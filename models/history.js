import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
});

const History = mongoose.model("History", HistorySchema);

export default History;
