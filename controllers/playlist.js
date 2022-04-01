import Playlist from "../models/playlist.js";

// @desc    Create new playlists
// @route   GET /api/v1/playlist
// @access  Private

const createPlaylist = async (req, res) => {
  const { name, description, videos } = req.body;
  const { id } = req.data;
  const playlist = new Playlist({
    name,
    description,
    userId: id,
    videos,
  });
  try {
    await playlist.save();
    res.status(201).send(playlist);
  } catch (err) {
    res.status(400).send(err);
  }
};

// @desc    Get all playlists
// @route   GET /api/v1/playlist/create
// @access  Private

const getPlaylists = async (req, res) => {
  res.status(200).json(res.advancedResults);
};

// @desc    Update Existing playlist
// @route   GET /api/v1/playlists/update/:playlistId
// @access  Private

const updatePlaylist = async (req, res) => {
  const { name, description, userId, videos } = req.body;
  const { playlistId } = req.params;
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description, userId, videos },
      { new: true }
    );
    res.status(200).send(playlist);
  } catch (err) {
    res.status(400).send(err);
  }
};

// @desc    Add Video to Existing playlist
// @route   GET /api/v1/playlist/addVideo/:playlistId/:videoId
// @access  Private

const addVideo = async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);
    playlist.videos.push(videoId);
    await playlist.save();
    res.status(200).send(playlist);
  } catch (err) {
    res.status(400).send(err);
  }
};

// @desc    Delete Each Playlist
// @route   Delete /api/v1/playlist/addVideo/:playlistId/:videoId
// @access  Private

const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  try {
    await Playlist.findByIdAndDelete(playlistId);
    res.status(200).send("Playlist deleted");
  } catch (err) {
    res.status(400).send(err);
  }
};

// @desc    Delete Each Video From Playlist
// @route   Delete /api/v1/playlist/delete/:playlistId/:videoId
// @access  Private

const deleteVideo = async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);
    playlist.videos.pull(videoId);
    await playlist.save();
    res.status(200).send(playlist);
  } catch (err) {
    res.status(400).send(err);
  }
};

export {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  addVideo,
  deletePlaylist,
  deleteVideo,
};
