import express from "express";
import {
  createFeeling,
  checkFeeling,
  getLikedVideos,
  deleteLikedVideo,
} from "../controllers/fellings.js";

const router = express.Router();
import middleware from "../middlewares/middleware.js";

router.use(middleware);

router.route("/like").post(createFeeling);

router.route("/check").post(checkFeeling);

router.route("/videos").get(getLikedVideos);
router.route("/delete").post(deleteLikedVideo);

export default router;
