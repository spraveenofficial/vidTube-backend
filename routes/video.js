import express from "express";
// const express = require('express')
import {
  getVideos,
  getVideo,
  videoUpload,
  updateVideo,
  uploadVideoThumbnail,
  deleteVideo,
  addNotes,
} from "../controllers/video.js";
import advancedResults from "../middlewares/advanceresult.js";
import Video from "../models/video.js";
import protect from "../middlewares/middleware.js";

const router = express.Router();

router.post("/upload", protect, videoUpload);

router.post("/notes", protect, addNotes);

router.route("/private").get(
  protect,
  advancedResults(
    Video,
    [
      { path: "userId" },
      { path: "categoryId" },
      { path: "likes" },
      { path: "dislikes" },
      // { path: "comments" },
    ],
    {
      status: "private",
    }
  ),
  getVideos
);

router
  .route("/")
  .get(
    advancedResults(
      Video,
      [
        { path: "userId", select: "channelName subscribers photoUrl" },
        { path: "categoryId" },
        { path: "likes" },
        { path: "dislikes" },
      ],
      { status: "public" }
    ),
    getVideos
  );

router
  .route("/:id")
  .get(getVideo)
  .put(protect, updateVideo)
  .delete(protect, deleteVideo);

router.route("/:id/thumbnails").put(protect, uploadVideoThumbnail);

export default router;
