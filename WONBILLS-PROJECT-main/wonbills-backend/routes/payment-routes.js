const express = require('express');
const router = express.Router();
const paymentControllers = require("../controllers/payment-controllers");
const { authenticateToken } = require("../middleware/check-auth");


router.post('/create', authenticateToken, paymentControllers.createPayment);
router.get('/', authenticateToken, paymentControllers.getPaymentsByUserId)
router.get('/:pid', authenticateToken, paymentControllers.getPaymentById);
router.put('/update-purchase/:pid', authenticateToken, paymentControllers.updatePaymentById);
router.patch("/toggle-purchase/:pid", authenticateToken, paymentControllers.togglePaymentStatusById);

module.exports = router;