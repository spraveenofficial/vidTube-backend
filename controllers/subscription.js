import asyncHandler from "../middlewares/async.js";
import ErrorResponse from "../utils/error.js";
import advanceResultFunction from "../utils/advanceResultFunction.js";
import Video from "../models/video.js";
import Subscription from "../models/subscription.js";

// @desc    Get all subscribers
// @route   GET /api/v1/subscriptions/subscribers
// @access  Private
const getSubscribers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get all channels subscribed to
// @route   GET /api/v1/subscriptions/channels
// @access  Private
const getChannels = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Check subscription
// @route   POST /api/v1/subscriptions/check
// @access  Private
const checkSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const channel = await Subscription.findOne({
    channelId: req.body.channelId,
    subscriberId: id,
  });
  console.log(channel);
  if (!channel) {
    return res.status(200).json({ success: true, data: {} });
  }
  return res.status(200).json({ success: true, data: channel });
});

// @desc    Create subscriber
// @route   Post /api/v1/subscriptions
// @access  Private
const createSubscriber = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const { channelId } = req.body;
  if (channelId.toString() == id.toString()) {
    return next(new ErrorResponse(`You can't subscribe to your own channle`));
  }
  let subscription = await Subscription.findOne({
    channelId: channelId,
    subscriberId: id,
  });

  if (subscription) {
    await subscription.remove();
    return res.status(200).json({ success: true, data: {} });
  } else {
    subscription = await Subscription.create({
      subscriberId: req.data.id,
      channelId: channelId,
    });
  }

  res.status(200).json({ success: true, data: subscription });
});

// @desc    Get subscribed videos
// @route   GET /api/v1/subscriptions/videos
// @access  Private
const getSubscribedVideos = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const channels = await Subscription.find({
    subscriberId: id,
  });

  if (channels.length === 0)
    return res.status(200).json({ success: true, data: {} });

  const channelsId = channels.map((channel) => {
    return {
      userId: channel.channelId.toString(),
    };
  });

  const populates = [{ path: "userId", select: "photoUrl channelName" }];
  advanceResultFunction(req, res, Video, populates, "public", channelsId);
});

export {
  getSubscribers,
  getChannels,
  checkSubscription,
  createSubscriber,
  getSubscribedVideos,
};
