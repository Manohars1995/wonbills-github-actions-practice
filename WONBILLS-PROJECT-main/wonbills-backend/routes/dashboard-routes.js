const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middleware/check-auth");
const DashboardControllers = require("../controllers/dashboard-controllers");

router.get("/vendor/charts", authenticateToken, DashboardControllers.getVendorDashboardCharts);
router.get("/vendor/charts/mobile", authenticateToken, DashboardControllers.getVendorDashboardChartsForMobile);

module.exports = router;