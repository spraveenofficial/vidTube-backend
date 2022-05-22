import History from "../models/history.js";

// @desc    Get Histories
// @route   GET /api/v1/history
// @access  Private

const fetchHistory = async (req, res) => {
  res.status(200).json(res.advancedResults);
};

// @desc    Update Histories
// @route   POST /api/v1/history
// @access  Private

const createHistory = async (req, res) => {
  const { video } = req.body;
  const { id } = req.data;
  const checkIfExits = await History.findOne({ user: id });
  if (checkIfExits) {
    const history = await History.findOneAndUpdate(
      { user: id },
      { $push: { videos: video } },
      { new: true }
    );
    res.status(201).send(history);
  } else {
    const createHistory = new History({
      user: id,
      videos: [video],
    });
    try {
      const history = await createHistory.save();
      res.status(201).json(history);
    } catch (error) {
      res.status(400).json(error);
    }
  }
};

// @desc    Delete All Histories (Clear)
// @route   DELETE /api/v1/history
// @access  Private

const deleteHistory = async (req, res) => {
  const { id } = req.data;
  try {
    const history = await History.findOneAndDelete({ userId: id });
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteHistoryVideo = async (req, res) => {
  const { id } = req.data;
  const { video } = req.body;
  try {
    const history = await History.findOneAndUpdate(
      { user: id },
      { $pull: { videos: video } },
      { new: true }
    );
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json(error);
  }
};

export { createHistory, fetchHistory, deleteHistory, deleteHistoryVideo };
