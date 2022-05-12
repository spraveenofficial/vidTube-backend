import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: "dtswa0rzu",
  api_key: "635545176889491",
  api_secret: "Io7NEcxupVnAQk9mlO_Wn8SnBd0",
});
class MainUpload {
  async uploadThumbnail(image, path) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            resource_type: "image",
            public_id: path,
            format: "png",
          },
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        )
        .end(image);
    });
    return result.secure_url;
  }

  async uploadVideo(video, path) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        video,
        {
          resource_type: "video",
          public_id: path,
          overwrite: true,
        },
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    return result.secure_url;
  }
}

export default new MainUpload();
