import WatchLater from "../models/watchLater.js";

const addToWatchLater = async (req, res) => {
  const { id } = req.data;
  const { videoId } = req.body;
  const ifExist = await WatchLater.findOne({ userId: id, videoId: videoId });
  if (ifExist) {
    await WatchLater.findOneAndDelete({
      userId: id,
      videoId,
    });
    return res.status(200).json({
      success: false,
      message: "Successfully Deleted from Watch Later.",
    });
  }
  const newWatchLater = new WatchLater({
    userId: id,
    videoId: videoId,
  });
  newWatchLater.save();
  return res.status(200).json({
    success: true,
    data: newWatchLater,
    message: "SuccessFully Added to Watch Later",
  });
};

const getAllWatchLaterVideos = async (req, res) => {
  const { id } = req.data;

  const watchLaterVideos = await WatchLater.find({ userId: id }).populate(
    "videoId userId"
  );
  if (!watchLaterVideos) {
    return res.status(400).json({
      success: true,
      message: "No watch Later Videos Found.",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Successfully fetched Watch Later Videos",
    videos: watchLaterVideos.map((video) => {
      return {
        ...video.videoId._doc,
        userId: video.userId._doc,
      };
    }),
  });
};

const deleteEachWatchLaterVideo = async (req, res) => {
  const { id } = req.data;
  const { videoId } = req.body;
  const ifExist = await WatchLater.findOne({ userId: id, videoId: videoId });
  if (!ifExist) {
    return res.status(400).json({
      success: false,
      message: "Video not found in Watch Later",
    });
  }
  await WatchLater.findOneAndDelete({ userId: id, videoId: videoId });
  return res.status(200).json({
    success: true,
    message: "Successfully Deleted from Watch Later",
  });
};

export { addToWatchLater, getAllWatchLaterVideos, deleteEachWatchLaterVideo };
