import asyncHandler from "../middlewares/async.js";
import ErrorResponse from "../utils/error.js";
import advanceResultFunction from "../utils/advanceResultFunction.js";
import Video from "../models/video.js";
import Feeling from "../models/feeling.js";
import Subscription from "../models/subscription.js";
import Notes from "../models/note.js";
import WatchLater from "../models/watchLater.js";
// @desc    Create feeling
// @route   POST /api/v1/feelings/
// @access  Private
const createFeeling = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  var { type, userId, videoId } = req.body;
  userId = id;
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ErrorResponse(`No video with video id of ${videoId}`));
  }
  if (video.status !== "public") {
    return next(
      new ErrorResponse(
        `You can't like/dislike this video until it's made pulbic`
      )
    );
  }
  // Check if feeling exists
  let feeling = await Feeling.findOne({
    videoId,
    userId,
  });
  if (!feeling) {
    feeling = await Feeling.create({
      type,
      videoId,
      userId,
    });
    if (type === "like") {
      return res
        .status(200)
        .json({ success: true, data: { liked: true, disliked: false } });
    } else {
      return res
        .status(200)
        .json({ success: true, data: { liked: false, disliked: true } });
    }
  }
  // else - check req.body.feeling if equals to feeling.type remove
  if (type == feeling.type) {
    await feeling.remove();
    return res
      .status(200)
      .json({ success: true, data: { liked: false, disliked: false } });
  }
  // else - change feeling type
  feeling.type = type;
  feeling = await feeling.save();

  return res
    .status(200)
    .json({ success: true, data: { liked: false, disliked: true } });
});

// @desc    Check feeling
// @route   POST /api/v1/feelings/check
// @access  Private
const checkFeeling = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const channelFrom = await Video.findOne({ id }).populate("userId");
  const feeling = await Feeling.findOne({
    videoId: req.body.videoId,
    userId: id,
  });
  const notes = await Notes.findOne({
    userId: id,
    videoId: req.body.videoId,
  }).select("notes");

  const watchLater = await WatchLater.findOne({
    userId: id,
    videoId: req.body.videoId,
  });
  if (!feeling) {
    return res.status(200).json({
      success: true,
      data: {
        liked: false,
        disliked: false,
        notes: notes ? notes.notes : [],
        isWatchLatered: watchLater ? true : false,
      },
    });
  } else {
    const channel = await Subscription.findOne({
      channelId: channelFrom.userId.id,
      subscriberId: id,
    });
    const dataTobeSent = {
      liked: feeling.type === "like",
      disliked: feeling.type === "dislike",
      isSubscribed: !!channel,
      notes: notes ? notes.notes : [],
      isWatchLatered: watchLater ? true : false,
    };
    return res.status(200).json({ success: true, data: dataTobeSent });
  }
});

// @desc    Get liked videos
// @route   GET /api/v1/feelings/videos
// @access  Private
const getLikedVideos = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const likes = await Feeling.find({
    userId: id,
    type: "like",
  });
  if (likes.length === 0)
    return res.status(404).json({ success: true, data: {} });

  const videosId = likes.map((video) => {
    return {
      _id: video.videoId.toString(),
      likedAt: video.createdAt.toString(),
    };
  });
  const populates = [{ path: "userId", select: "photoUrl channelName" }];
  advanceResultFunction(req, res, Video, populates, "public", videosId);
});

const deleteLikedVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const { videoId } = req.body;
  const feeling = await Feeling.findOne({
    videoId,
    userId: id,
    type: "like",
  });
  if (!feeling) {
    return res.status(400).json({ success: false, message: "No video found" });
  }
  await feeling.remove();
  return res
    .status(200)
    .json({ success: true, message: "Successfully Deleted Liked Video" });
});
export { createFeeling, checkFeeling, getLikedVideos, deleteLikedVideo };
