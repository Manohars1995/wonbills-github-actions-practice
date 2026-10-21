const express = require("express");
const multer = require("multer");
const router = express.Router();
const { authenticateToken } = require("../middleware/check-auth");
const clientControllers = require("../controllers/client-controllers");

// Multer configuration for file uploads
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

// Set up multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 5MB limit
    },
    fileFilter,
});


router.post("/create", authenticateToken, clientControllers.createClient);
router.put("/update-client/:cid", authenticateToken, clientControllers.updateClientById);
router.get("/:cId", authenticateToken, clientControllers.getClientById)
router.post("/export/excel2", clientControllers.downloadExcelSheet);
router.get("/", authenticateToken, clientControllers.getClientsByUserId);
router.get("/active/clients", authenticateToken, clientControllers.getActiveClientsByUserId);
router.post("/export/excel2", authenticateToken, clientControllers.downloadExcelSheet);
router.put("/import/data", authenticateToken, clientControllers.importExcelSheet);
router.patch("/toggle-client/:cid", authenticateToken, clientControllers.toggleClientStatusById)




module.exports = router;