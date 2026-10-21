const express = require('express');
const router = express.Router();
const sharedControllers = require('../controllers/shared-controllers');
const { authenticateToken } = require('../middleware/check-auth');
const multer = require("multer");


const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/heif",
        "image/heic", // HEIF & HEIC Support
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
    fileFilter,
});

router.get('/pincode-info/:pincode', sharedControllers.getPincodeData);

router.post('/send/invite', authenticateToken, sharedControllers.sendInviteEmail);
router.post('/upload/image', authenticateToken, upload.any(), sharedControllers.uploadImageToS3Bucket)
router.post('/demo', sharedControllers.getRequestDemoWonBills);

module.exports = router;