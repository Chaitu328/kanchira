const cloudinary = require("../cloudnaryConfig");

exports.uploadImage = async (req, res) => {
  try {
    // Accept file uploaded under either "file" or "image" field name
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message:
          "No file uploaded. Make sure you are sending a file in the 'file' field.",
      });
    }

    console.log("Uploading file:", file.originalname, "size:", file.size);

    // Validate it's an image
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed.",
      });
    }

    // Upload buffer to Cloudinary via upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "kanchira-uploads",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            success: false,
            message: "Cloudinary upload failed",
            error: error.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Image uploaded successfully!",
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};
