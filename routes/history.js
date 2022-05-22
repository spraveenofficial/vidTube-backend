import express from "express";
import middleware from "../middlewares/middleware.js";

import {
  createHistory,
  deleteHistory,
  fetchHistory,
  deleteHistoryVideo,
} from "../controllers/history.js";
import advancedResults from "../middlewares/advanceresult.js";
import History from "../models/history.js";
const router = express.Router();

router.use(middleware);

router.route("/").post(createHistory);
router
  .route("/")
  .get(
    advancedResults(History, [{ path: "videos" }], { status: "history" }),
    fetchHistory
  );
router.route("/").delete(deleteHistory);
router.route("/remove").delete(deleteHistoryVideo);
export default router;
