import path from "path";
import fs from "fs";
import asyncHandler from "../middlewares/async.js";
import ErrorResponse from "../utils/error.js";
import cloudinary from "cloudinary";
import Video from "../models/video.js";
import UploadServices from "../services/upload.js";
// import { getVideoDurationInSeconds } from "get-video-duration";
cloudinary.config({
  cloud_name: "dtswa0rzu",
  api_key: "635545176889491",
  api_secret: "Io7NEcxupVnAQk9mlO_Wn8SnBd0",
});

// @desc    Get videos
// @route   GET /api/v1/videos/public or /api/v1/videos/private
// @access  Public Or Private
const getVideos = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single video
// @route   GET /api/v1/videos/:id
// @access  Public
const getVideo = asyncHandler(async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate({
        path: "categoryId",
      })
      .populate({
        path: "userId",
        select: "channelName subscribers photoUrl",
        matchMedia: { status: "public" },
      })
      .populate({ path: "likes" })
      .populate({ path: "dislikes" });

    if (!video) {
      return next(
        new ErrorResponse(`No video with that id of ${req.params.id}`)
      );
    } else {
      res.status(200).json({ sucess: true, data: video });
      updateViews(req.params.id);
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Upload video
// @route   PUT /api/v1/video
// @access  Private
const videoUpload = asyncHandler(async (req, res, next) => {
  const { id } = req.data;
  const file = req.files;
  const filePath = file.file.tempFilePath;
  const video = file.file;
  const thumbnail = file.thumbnail;
  if (!video.mimetype.startsWith("video")) {
    return next(new ErrorResponse(`Please upload a video`, 404));
  }

  if (video.size > process.env.MAX_FILE_UPLOAD * 5) {
    return next(
      new ErrorResponse(
        `Please upload a video less than ${
          (process.env.MAX_FILE_UPLOAD * 5) / 1000 / 1000
        }mb`,
        404
      )
    );
  }

  if (!thumbnail.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image for thumbnail`, 404));
  }
  // Transform thumbnail to base64 format
  const buffer = await fs.readFileSync(thumbnail.tempFilePath);
  const base64data = buffer.toString("base64");
  const dataToUpload = `data:${thumbnail.mimetype};base64,${base64data}`;
  const thumbnailPath = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  // Get video duration in seconds and convert it to minutes using getVideoDurationInSeconds without ffprobe
  // const duration = await getVideoDurationInSeconds(filePath);
  const videoPath = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  try {
    const uploadVideo = await UploadServices.uploadVideo(filePath, videoPath);
    const uploadThumbnail = await UploadServices.uploadThumbnail(
      dataToUpload,
      thumbnailPath
    );

    if (!uploadThumbnail || !uploadVideo) {
      return next(new ErrorResponse(`Video Upload Failed.`, 404));
    } else {
      const pushVideo = await Video.create({
        title: req.body.title,
        description: req.body.description,
        thumbnailUrl: uploadThumbnail,
        url: uploadVideo,
        categoryId: req.body.categoryId,
        userId: id,
        // duration,
      });
      res.status(201).json({ success: true, data: pushVideo });
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse(`Video Upload Failed.`, 404));
  }
});

// @desc    Update video
// @route   PUT /api/v1/videos/:id
// @access  Private
const updateVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!video)
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`));

  res.status(200).json({ success: true, data: video });
});

// @desc    Update video views
// @route   PUT /api/v1/videos/:id/views
// @access  Public
const updateViews = asyncHandler(async (id) => {
  let video = await Video.findById(id);
  video.views++;

  await video.save();

  // res.status(200).json({ success: true, data: video });
});

// @desc    Upload thumbnail
// @route   PUT /api/v1/videos/:id/thumbnail
// @access  Private
const uploadVideoThumbnail = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);
  if (!video)
    return next(new ErrorResponse(`No video with id of ${req.params.id}`, 404));

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404));
  }

  const file = req.files.thumbnail;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 404));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    );
  }

  file.name = `thumbnail-${video._id}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/thumbnails/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await Video.findByIdAndUpdate(req.params.id, { thumbnailUrl: file.name });

      res.status(200).json({ success: true, data: file.name });
    }
  );
});

// @desc    Delete video
// @route   DELETE /api/v1/videos/:id
// @access  Private
const deleteVideo = asyncHandler(async (req, res, next) => {
  let video = await Video.findOne({ userId: req.user._id, _id: req.params.id });

  if (!video) {
    return next(new ErrorResponse(`No video with id of ${req.params.id}`, 404));
  }

  fs.unlink(
    `${process.env.FILE_UPLOAD_PATH}/videos/${video.url}`,
    async (err) => {
      if (err) {
        return next(
          new ErrorResponse(
            `Something went wrong, couldn't delete video photo`,
            500
          )
        );
      }
      fs.unlink(
        `${process.env.FILE_UPLOAD_PATH}/thumbnails/${video.thumbnailUrl}`,
        async (err) => {
          // if (err) {
          //   return next(
          //     new ErrorResponse(
          //       `Something went wrong, couldn't delete video photo`,
          //       500
          //     )
          //   )
          // }
          await video.remove();
          return res.status(200).json({ success: true, video });
        }
      );
    }
  );
});

export {
  getVideos,
  getVideo,
  videoUpload,
  updateVideo,
  updateViews,
  uploadVideoThumbnail,
  deleteVideo,
};
