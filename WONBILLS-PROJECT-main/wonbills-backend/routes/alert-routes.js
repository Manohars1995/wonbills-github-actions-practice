const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/check-auth');
const alertControllers = require('../controllers/alert-controllers');

router.get("/me", authenticateToken, alertControllers.getAlertsByUserId);
router.patch("/mark-read/:alertId", authenticateToken, alertControllers.markAlertAsRead);
router.put("/update-read/:vid", authenticateToken, alertControllers.updateAlertsByUserId);


module.exports = router;