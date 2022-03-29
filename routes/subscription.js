import express from "express";

import {
  getChannels,
  getSubscribers,
  createSubscriber,
  checkSubscription,
  getSubscribedVideos,
} from "../controllers/subscription.js";
import Subscription from "../models/subscription.js";
import protect from "../middlewares/middleware.js";
import advancedResults from "../middlewares/advanceresult.js";
const router = express.Router();

router.post("/", protect, createSubscriber);

router.post("/check", protect, checkSubscription);

router.route("/subscribers").get(
  protect,
  advancedResults(Subscription, [{ path: "subscriberId" }], {
    status: "public",
    filter: "channel",
  }),
  getSubscribers
);

router
  .route("/channels")
  .get(
    protect,
    advancedResults(Subscription, [
      { path: "channelId", select: "photoUrl channelName" },
    ]),
    getChannels
  );

router.route("/videos").get(protect, getSubscribedVideos);

export default router;
