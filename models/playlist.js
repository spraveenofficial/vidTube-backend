import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    videos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

const Playlist = mongoose.model("playlists", PlaylistSchema);

export default Playlist;
