const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

//  Uploads an image to the S3 bucket.

const uploadImageToS3Bucket = async (file) => {
  try {
    // Validate file input
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/heif",
      "image/heic",
    ];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname) || ".jpg"; // Default to .jpg if extension is missing
    const randomName = crypto.randomBytes(16).toString("hex");
    const key = `media/${randomName}${fileExtension}`;

    // Prepare upload parameters
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the URL
    const imageUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${key}`;

    return imageUrl;
  } catch (err) {
    console.error("Error uploading image:", err);
    throw new Error(`Image upload failed: ${err.message}`);
  }
};

//  Deletes an image from the S3 bucket.

const deleteImageFromS3Bucket = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    const url = new URL(imageUrl);

    let objectKey = "";

    // Path-style: https://s3.region.amazonaws.com/bucket/key
    if (url.hostname === `s3.${region}.amazonaws.com`) {
      const parts = url.pathname.split("/").filter(Boolean); // [bucket, ...key]
      if (parts[0] !== bucketName) {
        throw new Error("Invalid bucket in URL");
      }
      objectKey = parts.slice(1).join("/");
    }

    // Virtual-hosted: https://bucket.s3.region.amazonaws.com/key
    else if (url.hostname === `${bucketName}.s3.${region}.amazonaws.com`) {
      objectKey = url.pathname.replace(/^\/+/, "");
    }

    else {
      throw new Error("Unsupported S3 URL format");
    }

    if (!objectKey) {
      throw new Error("Could not extract object key");
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

  } catch (err) {
    console.error("Error deleting image:", err);
    throw new Error(`Image deletion failed: ${err.message}`);
  }
};

module.exports = { uploadImageToS3Bucket, deleteImageFromS3Bucket };
