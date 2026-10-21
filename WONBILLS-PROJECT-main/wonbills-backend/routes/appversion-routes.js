const express = require("express");

const appVersionControllers = require("../controllers/appversion-controllers");

const router = express.Router();

router.get("/:app", appVersionControllers.getAppVersion);

router.get("/", appVersionControllers.getAllAppVersions);

module.exports = router;