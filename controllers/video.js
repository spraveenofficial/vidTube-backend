import path from "path";
import fs from "fs";
import asyncHandler from "../middlewares/async.js";
import ErrorResponse from "../utils/error.js";
import cloudinary from "cloudinary";
import Video from "../models/video.js";
import Feeling from "../models/feeling.js";

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
      // How to get true false isLiked and isDisliked
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
      const feeling = await Feeling.findOne({
        videoId: video.id,
        userId: req.params.id,
      });
      res.status(200).json({ sucess: true, data: video, feeling });
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
    await videoModel.remove();
    return next(
      new ErrorResponse(
        `Please upload a video less than ${
          (process.env.MAX_FILE_UPLOAD * 5) / 1000 / 1000
        }mb`,
        404
      )
    );
  }
  let videoModel = await Video.create({ userId: id });
  const title = req.body.title;
  const nameForVideo = `video-${videoModel._id}${path.parse(video.name).ext}`;
  const nameForThumbnail = `thumb-${videoModel._id}${
    path.parse(thumbnail.name).ext
  }`;
  try {
    cloudinary.v2.uploader.upload(
      filePath,
      {
        resource_type: "video",
        public_id: nameForVideo,
        overwrite: true,
      },
      async function (error, result) {
        if (error)
          return res.status(402).json({
            success: false,
            message: error.message,
          });
        thumbnail.mv(`${process.env.FILE_UPLOAD_PATH}/${nameForThumbnail}`);
        videoModel = await Video.findByIdAndUpdate(
          videoModel._id,
          {
            url: result.secure_url,
            title: title,
            thumbnailUrl: nameForThumbnail,
            description: req.body.description,
          },
          { new: true, runValidators: true }
        );

        res
          .status(200)
          .json({ message: "Successfully Uploaded", success: true });
      }
    );
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
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
