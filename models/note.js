import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    notes: {
      type: [],
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

const notesModel = mongoose.model("Note", NoteSchema);

export default notesModel;
