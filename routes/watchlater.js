import express from "express";
import {
  addToWatchLater,
  getAllWatchLaterVideos,
  deleteEachWatchLaterVideo,
} from "../controllers/watchlater.js";
import middleware from "../middlewares/middleware.js";
const router = express.Router();

router.use(middleware);

router.post("/add", addToWatchLater);
router.get("/", getAllWatchLaterVideos);
router.delete("/delete", deleteEachWatchLaterVideo);
export default router;
