import mongoose from "mongoose";

const Schema = mongoose.Schema;

const WatchLater = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

const WatchLaterModel = mongoose.model("WatchLater", WatchLater);

export default WatchLaterModel;
