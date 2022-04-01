import express from "express";

import {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  addVideo,
  deletePlaylist,
  deleteVideo,
} from "../controllers/playlist.js";
import advancedResults from "../middlewares/advanceresult.js";
import middleware from "../middlewares/middleware.js";
import Playlist from "../models/playlist.js";
const router = express.Router();

router.use(middleware);

router
  .route("/")
  .get(advancedResults(Playlist, [{ path: "videos" }]), getPlaylists);
router.route("/create").post(createPlaylist);
router.route("/update/:playlistId").put(updatePlaylist);
router.route("/addVideo/:playlistId/:videoId").put(addVideo);
router.route("/delete/:playlistId").delete(deletePlaylist);
router.route("/delete/:playlistId/:videoId").delete(deleteVideo);
export default router;
