const express = require('express');
const router = express.Router();
const invoiceControllers = require("../controllers/invoice-controllers");
const { authenticateToken } = require("../middleware/check-auth");

router.post('/create', authenticateToken, invoiceControllers.createInvoice);
router.get("/", authenticateToken, invoiceControllers.getInvoicesByUserId);
router.get("/inv/:id", authenticateToken, invoiceControllers.getInvoiceById)
router.put("/update-invoice/:id", authenticateToken, invoiceControllers.updateInvoiceById);
router.get("/active/invs", authenticateToken, invoiceControllers.getActiveInvoices);
router.get("/client-vendor/details/:invoiceId", authenticateToken, invoiceControllers.getInvoicePdfData);
router.patch("/toggle-invoice/:invId", authenticateToken, invoiceControllers.toggleInvoiceStatusById)


module.exports = router;