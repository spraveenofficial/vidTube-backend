import WatchLater from "../models/watchlater.js";

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

export { addToWatchLater };
