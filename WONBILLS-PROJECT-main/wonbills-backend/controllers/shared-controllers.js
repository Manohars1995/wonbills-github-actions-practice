
const path = require("path");
const fs = require("fs");
const Razorpay = require("razorpay");
const { EmailTransporter } = require("../utils/email-transporter");
const crypto = require("crypto");

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const User = require("../models/users");
const { requestDemoWonBills } = require("../services/RequestDemoServices");



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const buildStreet = ({ Name, Block, Division }) => {
  // Collect meaningful parts
  const parts = [Name, Block, Division].filter(Boolean);

  let street = parts.join(", ").trim();

  // Razorpay requirement: minimum 10 characters
  if (street.length < 10) {
    street = `${street}, India`.trim();
  }

  return street;
};





//  Uploads an image to the S3 bucket.
const uploadImageToS3Bucket = async (req, res) => {
  try {
    const file = req?.files[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname) || ".jpg";
    const randomName = crypto.randomBytes(16).toString("hex");
    const key = `media/${randomName}${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${key}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: imageUrl,
    });
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return res.status(500).json({
      success: false,
      message: "Image upload failed. Please try again.",
    });
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

    const bucketBaseUrl = `https://s3.${region}.amazonaws.com/${bucketName}/`;

    // Validate URL
    if (!imageUrl.startsWith(bucketBaseUrl)) {
      throw new Error("Invalid URL for this bucket");
    }

    // Extract key
    const objectKey = imageUrl.replace(bucketBaseUrl, "");

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

const sendInviteEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userID = req.user?.userId;
    const inviteLink = "https://wonbills.com";

    /* ---------------- AUTH CHECK ---------------- */
    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /* ---------------- INPUT VALIDATION ---------------- */
    if (
      !email ||
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }


    const normalizedEmail = email.trim().toLowerCase();

    /* ---------------- CHECK EXISTING USER ---------------- */
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    /* ---------------- GET VENDOR DETAILS ---------------- */
    const vendor = await User.findById(userID).select("company_details");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    const vendorName = vendor.company_details?.name || "Vendor";

    /* ---------------- LOAD EMAIL TEMPLATE ---------------- */
    const emailTemplatePath = path.join(
      process.cwd(),
      ".",
      "emailTemps",
      "invite-temp.html"
    );

    let inviteEmailTemp;

    try {
      inviteEmailTemp = fs.readFileSync(emailTemplatePath, "utf-8");
    } catch (err) {
      console.error("Email template read error:", err);
      return res.status(500).json({
        success: false,
        message: "Email template could not be loaded"
      });
    }

    /* ---------------- TEMPLATE REPLACEMENT ---------------- */
    inviteEmailTemp = inviteEmailTemp
      .replace(/{{vendor_name}}/g, vendorName)
      .replace(/{{invite_link}}/g, inviteLink);

    /* ---------------- SEND EMAIL ---------------- */
    try {
      await EmailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "You’re invited to join WonBills",
        html: inviteEmailTemp
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send invitation email"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully"
    });

  } catch (error) {
    console.error("Invite controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get pin code data
const getPincodeData = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format"
      });
    }

    const response = await fetch(
  `https://api.postalpincode.in/pincode/${pincode}`
);

if (!response.ok) {
  throw new Error(`Postal API failed with ${response.status}`);
}

const parsedContent = await response.json();

    if (
      !Array.isArray(parsedContent) ||
      parsedContent[0]?.Status !== "Success"
    ) {
      return res.status(404).json({
        success: false,
        message: "Wrong pincode"
      });
    }

    const postOffice = parsedContent[0].PostOffice?.[0];

    if (!postOffice) {
      return res.status(404).json({
        success: false,
        message: "No post office data found"
      });
    }

    const {
      Name,
      District,
      State,
      Country,
      Block,
      Division,
      BranchType,
      Circle
    } = postOffice;

    const street = buildStreet({ Name, Block, Division });

    return res.status(200).json({
      success: true,
      message: "Pincode information retrieved successfully",
      data: {
        street,
        locality: Block || Name,
        district: District,
        state: State,
        country: Country,
        division: Division,
        branch_type: BranchType,
        circle: Circle,
        city: Division || Name
      }
    });

  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


const checkSubscriptionStatusByUserID = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    // Fetch user
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const currentDate = new Date();
    const trialExpiry = user.trial_expiry ? new Date(user.trial_expiry) : null;

    // If no expiry date exists
    if (!trialExpiry) {
      return {
        success: false,
        message: "Invalid subscription data",
      };
    }

    //  FREE TRIAL MODE
    if (user.free_trial === true) {
      if (trialExpiry <= currentDate) {
        // Expired — turn off free trial
        user.free_trial = false;
        await user.save();

        return {
          expiry: user.trial_expiry,
          success: false,
          message: "Free trial expired",
        };
      }

      return {
        expiry: user.trial_expiry,
        success: true,
        message: "Free trial active",
      };
    }

    // NORMAL SUBSCRIPTION MODE
    if (trialExpiry <= currentDate) {
      // Subscription expired
      user.is_subscribed = false;
      await user.save();

      return {
        expiry: user.trial_expiry,
        success: false,
        message: "Subscription expired",
      };
    }

    return {
      expiry: user.trial_expiry,
      success: true,
      message: "Subscription active",
    };
  } catch (err) {
    console.error("Error checking subscription status:", err);
    return {
      success: false,
      message: "Failed to check subscription status",
    };
  }
};

const getSubscriptionDetailsByUserID = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch user with ONLY subscription-related fields
    const user = await User.findById(
      userId,
      "trial_expiry is_subscribed free_trial current_plan"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched Subscription Details",
      data: {
        trialExpiry: user.trial_expiry,
        isSubscribed: user.is_subscribed === "true",
        isFreeTrialActive: user.free_trial === "true",
        currentPlan: user.current_plan,
      },
    });

  } catch (err) {
    console.error("Error fetching subscription details:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
    });
  }
};

const getRequestDemoWonBills = async (req, res, next) => {
    const {
        name,
        contact,
        email,
        organization,
        time,
        source,
        matter
    } = req.body;

    try {
        await requestDemoWonBills(
            name,
            contact,
            email,
            organization,
            time,
            source,
            matter
        );
        res.status(200).json({ success: true });
    } catch (err) {
        const error = new HttpError(`Something went wrong, could not send request. ${err.message}`, 500);
        return next(error);
    }
};


module.exports = {
  sendInviteEmail,
  getPincodeData,
  checkSubscriptionStatusByUserID,
  getSubscriptionDetailsByUserID,
  uploadImageToS3Bucket,
  deleteImageFromS3Bucket,
  getRequestDemoWonBills
}