const Alert = require("../models/alerts");
const Invoice = require("../models/invoice");
const Client = require("../models/client");
const Payment = require("../models/payment");
const mongoose = require("mongoose");

const getAlertsByUserId = async (req, res) => {
  try {
    const userId = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- PAGINATION ---------------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 50); // hard cap
    const skip = (page - 1) * limit;

    /* ---------------- FETCH ALERTS ---------------- */
    const [alerts, total] = await Promise.all([
      Alert.find({ vendor_id: userId })
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(limit)
        .lean(),

      Alert.countDocuments({ vendor_id: userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched alerts successfully",
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + alerts.length < total,
      },
    });

  } catch (err) {
    console.error("Error fetching alerts:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts. Please try again later.",
    });
  }
};

const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert ID",
      });
    }

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update alert",
    });
  }
};

const updateAlertsByUserId = async (req, res) => {
  try {
    const userId = req.params.vid;
    const { alert_id, read } = req.body;

    // Validate inputs
    if (!alert_id || typeof read === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Alert ID and read status are required.",
      });
    }

    // Check if alert exists for this user
    const alert = await Alert.findOne({ _id: alert_id, vendor_id: userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found for this user.",
      });
    }

    // Update read status
    alert.read = read;
    await alert.save();

    return res.status(200).json({
      success: true,
      message: "Alert read status updated successfully.",
    });

  } catch (err) {
    console.error("Error updating alert:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update alert. Please try again later.",
    });
  }
};

const PaymentDueAlertLog = async () => {
  try {
    const today = new Date();

    // Get date 3 days from now
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // Find payments due within 3 days & in "requested" state
    const duePayments = await Payment.find({
      payment_due_date: { $gte: today, $lte: threeDaysLater },
      payment_state: "requested",
    });

    if (!duePayments.length) return;

    // Prepare all alert insert operations
    const alertDocuments = [];

    for (const payment of duePayments) {
      // Fetch invoice
      const invoice = await Invoice.findById(payment.invoice_id);
      if (!invoice) continue;

      // Fetch client
      const client = await Client.findById(invoice.client);
      if (!client) continue;

      // Calculate remaining days
      const daysRemaining = Math.ceil(
        (payment.payment_due_date - today) / (1000 * 60 * 60 * 24)
      );

      // Create alert text
      const alertText = `Payment for invoice ${invoice.custom_invoice_id} is due in ${daysRemaining} day(s).`;

      // Push alert document
      alertDocuments.push({
        alert_text: alertText,
        reference_table: "payments",
        vendor_id: payment.vendor_id,
        read: false,
      });
    }

    // Bulk insert alerts (faster than multiple inserts)
    if (alertDocuments.length > 0) {
      await Alert.insertMany(alertDocuments);
    }

  } catch (error) {
    console.error("Error in PaymentDueAlertLog:", error);
  }
};

const PaymentOverDueAlertLog = async () => {
  try {
    const today = new Date();

    // Fetch all overdue payments
    const overduePayments = await Payment.find({
      payment_due_date: { $lt: today },
      payment_state: "requested",
    });

    if (!overduePayments.length) return;

    const alertDocuments = [];

    // Loop through overdue payments
    for (const payment of overduePayments) {
      // Fetch invoice
      const invoice = await Invoice.findById(payment.invoice_id);
      if (!invoice) continue;

      // Fetch client
      const client = await Client.findById(invoice.client);
      if (!client) continue;

      // Calculate days exceeded
      const daysExceeded = Math.ceil(
        (today - payment.payment_due_date) / (1000 * 60 * 60 * 24)
      );

      // Create alert text
      const alertText = `Payment for invoice ${invoice.custom_invoice_id} is overdue by ${daysExceeded} day(s).`;

      // Push alert into bulk array
      alertDocuments.push({
        alert_text: alertText,
        reference_table: "payments",
        vendor_id: payment.vendor_id,
        read: false,
      });
    }

    // Insert all alerts in one go (FAST)
    if (alertDocuments.length > 0) {
      await Alert.insertMany(alertDocuments);
    }

  } catch (error) {
    console.error("Error in PaymentOverDueAlertLog:", error);
  }
};

const updateAlertsOnLowStock = async (lowStockProducts, userID) => {
  try {
    // Validate input
    if (!Array.isArray(lowStockProducts) || lowStockProducts.length === 0) {
      throw new Error("No low-stock products provided");
    }

    if (!userID) {
      throw new Error("User ID is required");
    }

    const alertDocs = [];

    for (const product of lowStockProducts) {
      const { product_id, product_name, quantity, custom_item_id } = product;

      // Validate required values
      if (!product_id || !product_name || !quantity) {
        throw new Error(
          `Incomplete product details for product ID: ${custom_item_id}`
        );
      }

      // Build alert text
      const alertText = `${product_name} with ID ${custom_item_id} is running low on stock (Quantity: ${quantity})`;

      // Build alert document for bulk insertion
      alertDocs.push({
        alert_text: alertText,
        reference_table: "products",
        vendor_id: userID,
        read: false,
      });
    }

    // Insert all alerts in one operation (FAST)
    const results = await Alert.insertMany(alertDocs);

    return results;

  } catch (error) {
    console.error("Error adding low-stock alerts:", error.message);
    throw new Error("Failed to insert low-stock alerts");
  }
};

const updateAlerts = async (purchaseOrderId, clientName, amount, vendorId) => {
  try {
    if (!purchaseOrderId || !clientName || !amount || !vendorId) {
      throw new Error("Missing required alert data");
    }

    // Create alert text
    const alertText = `Received payment of ${amount} for Purchase Order ${purchaseOrderId} from client ${clientName}`;

    // Insert alert into MongoDB
    const alertDoc = await Alert.create({
      alert_text: alertText,
      reference_table: "payments",
      vendor_id: vendorId,
      read: false
    });

    return alertDoc;

  } catch (error) {
    console.error("Error adding alert:", error.message);
    throw new Error("Failed to insert alert");
  }
};

module.exports = {
  getAlertsByUserId,
  markAlertAsRead,
  updateAlertsByUserId,
  PaymentDueAlertLog,
  PaymentOverDueAlertLog,
  updateAlertsOnLowStock,
  updateAlerts
}