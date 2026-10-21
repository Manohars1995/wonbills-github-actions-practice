// controllers/webhook-controllers.js
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { createOrdertoTransferAmount } = require("../utils/razorpay/razorpay-helpers");
const { updateClient } = require("../utils/EmailUtils");
const { updatePayments } = require("./payment-controllers");
const { updateAlerts } = require("./alert-controllers");
const { markInvoiceInactive } = require("./invoice-controllers");
const { sendRenewalSuccessfulEmail } = require("../utils/EmailUtils");
const SubscriptionPayment = require("../models/subscriptionPayment");
const User = require("../models/users");
const Alert = require("../models/alerts");



const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// function to update alerts when bank status updated
const updateAlertsOnKyCResponse = async (payloadData) => {
  try {
    if (!payloadData?.event || !payloadData?.payload?.product?.entity) {
      return;
    }

    const entity = payloadData.payload.product.entity;
    const event = payloadData.event;

    const razorpayAccountId = entity.account_id;
    if (!razorpayAccountId) return;

    /* ---------------- EVENT → STATUS ---------------- */
    const eventStatusMap = {
      "product.route.activated": "activated",
      "product.route.rejected": "rejected",
      "product.route.under_review": "under_review",
      "product.route.needs_clarification": "needs_clarification"
    };

    const status = eventStatusMap[event];
    if (!status) return;

    /* ---------------- FETCH USER ---------------- */
    const user = await User.findOne({
      razorpay_account_id: razorpayAccountId
    }).select("_id razorpay_account_status");

    if (!user) {
      console.warn(
        `Alert skipped: No user for Razorpay account ${razorpayAccountId}`
      );
      return;
    }

    /* ---------------- IDEMPOTENCY GUARD ---------------- */
    // If alert already exists for this status, do nothing
    const existingAlert = await Alert.findOne({
      vendor_id: user._id,
      reference_table: "razorpay_kyc",
      reference_status: status
    });

    if (existingAlert) return;

    /* ---------------- MESSAGE BUILD ---------------- */
    const reason =
      entity.reason ||
      entity.failure_reason ||
      "No reason provided";

    const description =
      entity.notes?.description ||
      entity.notes?.comment ||
      "";

    const eventMessages = {
      activated: "Account activated: You can start sending payments now!",
      rejected: `Account rejected: ${reason} ${description}`,
      under_review: `Account under review: ${reason} ${description}`,
      needs_clarification: `Additional KYC clarification required: ${reason} ${description}`
    };

    const alertText = eventMessages[status];
    if (!alertText) return;

    /* ---------------- CREATE ALERT ---------------- */
    await Alert.create({
      alert_text: alertText,
      reference_table: "razorpay_kyc",
      reference_status: status,
      vendor_id: user._id,
      createdAt: new Date()
    });

  } catch (error) {
    // ⚠️ DO NOT throw — webhook must stay stable
    console.error("updateAlertsOnKyCResponse error:", error);
  }
};

// previously handleSuccessfulPayment
const handlePaymentSuccessOnSubscription = async (payload) => {
  try {
    console.log('got here on success')
    const payment =
      payload?.payload?.payment?.entity ||
      payload?.payload?.order?.entity;

    if (!payment) {
      throw new Error("Invalid Razorpay webhook payload");
    }

    const orderId = payment.order_id || payment.id;
    const paymentId = payment.id;

    if (!orderId || !paymentId) {
      throw new Error("Missing order_id or payment_id");
    }

    /* ---------------- PAYMENT IDEMPOTENCY ---------------- */
    const subscriptionPayment = await SubscriptionPayment.findOneAndUpdate(
      {
        order_id: orderId,
        status: "pending"
      },
      {
        status: "paid"
      },
      { new: true }
    );

    // Already processed
    if (!subscriptionPayment) return;

    /* ---------------- USER FETCH ---------------- */
    const user = await User.findById(subscriptionPayment.user_id);
    if (!user) {
      throw new Error("User not found for subscription");
    }

    /* ---------------- EXPIRY CALCULATION ---------------- */
    const now = new Date();

    // IMPORTANT: extend from existing expiry if active
    const baseDate =
      user.subscription_expiry && user.subscription_expiry > now
        ? new Date(user.subscription_expiry)
        : now;

    const expiry = new Date(baseDate);

    if (user.plan_interval === "yearly") {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    /* ---------------- USER UPDATE ---------------- */
    await User.findByIdAndUpdate(user._id, {
      is_subscribed: true,
      free_trial: false,

      subscription_expiry: expiry,
      plan_started_at: now,

      subscription_status: "active",
      current_plan: "pro",

      subscription_details: {
        provider: "razorpay",
        order_id: orderId,
        payment_id: paymentId,
        auto_renew: false
      }
    });

  } catch (error) {
    console.error("handlePaymentSuccessOnSubscription error:", error);
    throw error;
  }
};


// function to handle failure on subscription failure
const handleExpiredSubsPayment = async (payload) => {
  try {
    const paymentLink = payload?.payload?.payment_link?.entity;
    if (!paymentLink) return;

    const orderId = paymentLink?.order_id;
    if (!orderId) return;

    await SubscriptionPayment.findOneAndUpdate(
      {
        order_id: orderId,
        status: "pending"
      },
      {
        status: "failed"
      }
    );

  } catch (error) {
    console.error("handleExpiredSubsPayment error:", error);
    throw error;
  }
};

// ----------------------------------- controllers -----------------------------------

// Transfers amount to linked account on successful payment

const transferAmoutToLinkedAccWebhook = async (req, res, next) => {
  try {
    console.log("=================================");
    console.log("WEBHOOK HIT");
    console.log("=================================");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET_TEST;
    const payload = req.body;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    if (payload.event === "payment.captured") {
      const payment = payload?.payload?.payment?.entity;
      if (!payment) {
        return res.status(400).send("Invalid payload format");
      }

      const appType = payment.notes?.app;
      if (appType !== "WON_BILLS") {
        return res.status(200).send("Payment not related to WON_BILLS, ignoring.");
      }

      // ✅ All variables declared here, inside the if block
      const paymentId = payment.id;
      const clientName = payment.notes?.client_name;
      const linkedAccountId = payment.notes?.vendor_rzp_linked_account_id;
      const currency = payment.notes?.currency || "INR";
      const PurchaseOrderID = payment.notes?.payment_id;
      const VendorId = payment.notes?.vendor_id;
      const invoice_id = payment.notes?.invoice_id;

      // ✅ Proper number conversion from paise → rupees
      const amount = Number(payment.notes?.total_amount || 0) / 100;
      const Fees = Number(payment.notes?.totalFee || 0) / 100;
      const AmountToTransfer = amount - Fees;

      console.log(payment, "payment entity in webhook")
      console.log("Transfer debug:", {
        amount,
        Fees,
        AmountToTransfer,
        linkedAccountId,
        currency,
        PurchaseOrderID,
        VendorId,
        invoice_id,
      });

      // ✅ await the transfer, use resolved order.id
      try {
        const order = await createOrdertoTransferAmount(
          linkedAccountId,
          amount,
          AmountToTransfer,
          currency,
          PurchaseOrderID,
          paymentId
        );

        console.log("Transfer success, order id:", order.id);

        await updatePayments(PurchaseOrderID);
        await updateAlerts(PurchaseOrderID, clientName, amount, VendorId);
        await updateClient(PurchaseOrderID, amount, VendorId, order.id);
        await markInvoiceInactive(invoice_id);

      } catch (transferError) {
        console.log("Transfer failed:", transferError.message);
      }
    }

    return res.status(200).send("Webhook received");

  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
};


// const transferAmoutToLinkedAccWebhook = async (req, res) => {
//   try {

//       console.log("=================================");
//     console.log("WEBHOOK HIT");
//     console.log("=================================");
// //     // const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET1;
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET_TEST;
//     const payload = req.body;
//     const signature = req.headers["x-razorpay-signature"];

//     /* -----------------------------------------
//        VERIFY WEBHOOK SIGNATURE
//     ----------------------------------------- */

//     const expectedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(JSON.stringify(payload))
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       return res.status(400).send("Invalid signature");
//     }

//     /* -----------------------------------------
//        HANDLE ONLY PAYMENT CAPTURE EVENT
//     ----------------------------------------- */

//     if (payload.event !== "payment.captured") {
//       return res.status(200).send("Ignored");
//     }

//     const payment = payload?.payload?.payment?.entity;

//     if (!payment) {
//       return res.status(400).send("Invalid payload format");
//     }

//     /* -----------------------------------------
//        CHECK APP TYPE
//     ----------------------------------------- */

//     const appType = payment.notes?.app;

//     if (appType !== "WON_BILLS") {
//       return res
//         .status(200)
//         .send("Payment not related to WON_BILLS, ignoring.");
//     }

//     /* -----------------------------------------
//        EXTRACT PAYMENT DETAILS
//     ----------------------------------------- */

//     const paymentId = payment.id;

//     const clientName =
//       payment.notes?.client_name;

//     const linkedAccountId =
//       payment.notes?.vendor_rzp_linked_account_id;

//     const currency =
//       payment.notes?.currency || "INR";

//     // total_amount expected in rupees
//     const amount =
//       Number(payment.notes?.total_amount || 0);

//     // fees expected in rupees
//     const Fees =
//       Number(payment.notes?.totalFee || 0);

//     // final vendor amount in rupees
//     const AmountToTransfer =
//       amount - Fees;

//     const PurchaseOrderID =
//       payment.notes?.purchase_order_id;

//     const VendorId =
//       payment.notes?.vendor_id;

//     const invoice_id =
//       payment.notes?.invoice_id;

//     /* -----------------------------------------
//        DEBUG LOGS
//     ----------------------------------------- */

//     console.log({
//       linkedAccountId,
//       amount,
//       Fees,
//       AmountToTransfer,
//       currency
//     },"details for transfer");

//     /* -----------------------------------------
//        CREATE TRANSFER
//     ----------------------------------------- */

//     const transfer = await razorpay.transfers.create({

//       account: linkedAccountId,

//       // convert rupees → paise
//       amount: Math.round(AmountToTransfer * 100),

//       currency: currency,

//       notes: {
//         purchaseID: PurchaseOrderID,
//         paymentID: paymentId,
//         app: "WON_BILLS",
//       },

//       linked_account_notes: [
//         "purchaseID",
//         "paymentID"
//       ],

//       on_hold: false
//     });

//     console.log(
//       "TRANSFER SUCCESS:",
//       transfer.id
//     );

//     /* -----------------------------------------
//        UPDATE DATABASES
//     ----------------------------------------- */

//     await updatePayments(PurchaseOrderID);

//     await updateAlerts(
//       PurchaseOrderID,
//       clientName,
//       amount,
//       VendorId
//     );

//     await updateClient(
//       PurchaseOrderID,
//       amount,
//       VendorId,
//       transfer.id
//     );

//     await markInvoiceInactive(invoice_id);

//     return res
//       .status(200)
//       .send("Transfer completed");

//   } catch (error) {
// console.log(error,"@@@ J");
//     console.error(
//       "TRANSFER FAILED:",
//       error?.response?.data || error
//     );

//     return res
//       .status(500)
//       .send("Internal Server Error");
//   }
// };

// const transferAmoutToLinkedAccWebhook = async (req, res) => {
//   try {

//     console.log("=================================");
//     console.log("WEBHOOK HIT");
//     console.log("=================================");

//     const webhookSecret =
//       process.env.RAZORPAY_WEBHOOK_SECRET1;

//     const payload = req.body;

//     const signature =
//       req.headers["x-razorpay-signature"];

//     console.log("EVENT:", payload?.event);

//     /* =====================================================
//        VERIFY WEBHOOK SIGNATURE
//     ===================================================== */

//     const expectedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(JSON.stringify(payload))
//       .digest("hex");

//     console.log("SIGNATURE:", signature);
//     console.log("EXPECTED :", expectedSignature);

//     if (signature !== expectedSignature) {

//       console.log("INVALID SIGNATURE");

//       return res
//         .status(400)
//         .send("Invalid signature");
//     }

//     console.log("SIGNATURE VERIFIED");

//     /* =====================================================
//        HANDLE ONLY payment.captured
//     ===================================================== */

//     if (payload.event !== "payment.captured") {

//       console.log("IGNORED EVENT");

//       return res
//         .status(200)
//         .send("Ignored");
//     }

//     /* =====================================================
//        GET PAYMENT ENTITY
//     ===================================================== */

//     const payment =
//       payload?.payload?.payment?.entity;

//     if (!payment) {

//       console.log("PAYMENT ENTITY MISSING");

//       return res
//         .status(400)
//         .send("Invalid payload format");
//     }

//     console.log(
//       "PAYMENT ENTITY:",
//       JSON.stringify(payment, null, 2)
//     );

//     /* =====================================================
//        CHECK APP TYPE
//     ===================================================== */

//     const appType = payment.notes?.app;

//     console.log("APP TYPE:", appType);

//     if (appType !== "WON_BILLS") {

//       console.log("IGNORED NON WON_BILLS PAYMENT");

//       return res
//         .status(200)
//         .send(
//           "Payment not related to WON_BILLS"
//         );
//     }

//     /* =====================================================
//        EXTRACT DETAILS
//     ===================================================== */

//     const paymentId = payment.id;

//     const clientName =
//       payment.notes?.client_name;

//     const linkedAccountId =
//       payment.notes?.vendor_rzp_linked_account_id;

//     const currency =
//       payment.notes?.currency || "INR";

//     // amount in rupees
//     const amount =
//       Number(payment.notes?.total_amount || 0);

//     // fees in rupees
//     const Fees =
//       Number(payment.notes?.totalFee || 0);

//     // final transfer amount in rupees
//     const AmountToTransfer =
//       amount - Fees;

//     const PurchaseOrderID =
//       payment.notes?.purchase_order_id;

//     const VendorId =
//       payment.notes?.vendor_id;

//     const invoice_id =
//       payment.notes?.invoice_id;

//     /* =====================================================
//        DEBUG VALUES
//     ===================================================== */

//     console.log("PAYMENT DETAILS:", {
//       paymentId,
//       linkedAccountId,
//       amount,
//       Fees,
//       AmountToTransfer,
//       currency,
//       PurchaseOrderID,
//       VendorId,
//       invoice_id
//     });

//     /* =====================================================
//        VALIDATIONS
//     ===================================================== */

//     if (!linkedAccountId) {

//       console.log(
//         "LINKED ACCOUNT ID MISSING"
//       );

//       return res
//         .status(400)
//         .send("Linked account missing");
//     }

//     if (AmountToTransfer <= 0) {

//       console.log(
//         "INVALID TRANSFER AMOUNT"
//       );

//       return res
//         .status(400)
//         .send("Invalid transfer amount");
//     }

//     /* =====================================================
//        CREATE TRANSFER
//     ===================================================== */

//     console.log("CREATING TRANSFER...");

//     const transfer =
//       await razorpay.transfers.create({

//         account: linkedAccountId,

//         // convert rupees → paise
//         amount: Math.round(
//           AmountToTransfer * 100
//         ),

//         currency: currency,

//         notes: {
//           purchaseID: PurchaseOrderID,
//           paymentID: paymentId,
//           app: "WON_BILLS"
//         },

//         linked_account_notes: [
//           "purchaseID",
//           "paymentID"
//         ],

//         on_hold: false
//       });

//     /* =====================================================
//        TRANSFER SUCCESS
//     ===================================================== */

//     console.log("=================================");
//     console.log("TRANSFER SUCCESS");
//     console.log("=================================");

//     console.log(
//       JSON.stringify(transfer, null, 2)
//     );

//     console.log(
//       "TRANSFER ID:",
//       transfer.id
//     );

//     /* =====================================================
//        UPDATE DATABASES
//     ===================================================== */

//     console.log("UPDATING DATABASES...");

//     await updatePayments(
//       PurchaseOrderID
//     );

//     console.log(
//       "PAYMENTS UPDATED"
//     );

//     await updateAlerts(
//       PurchaseOrderID,
//       clientName,
//       amount,
//       VendorId
//     );

//     console.log(
//       "ALERTS UPDATED"
//     );

//     await updateClient(
//       PurchaseOrderID,
//       amount,
//       VendorId,
//       transfer.id
//     );

//     console.log(
//       "CLIENT UPDATED"
//     );

//     await markInvoiceInactive(
//       invoice_id
//     );

//     console.log(
//       "INVOICE MARKED INACTIVE"
//     );

//     console.log("=================================");
//     console.log("WEBHOOK COMPLETED");
//     console.log("=================================");

//     return res
//       .status(200)
//       .send("Transfer completed");

//   } catch (error) {

//     console.log("=================================");
//     console.log("TRANSFER FAILED");
//     console.log("=================================");

//     console.log("FULL ERROR:");
//     console.log(error);

//     console.log("ERROR MESSAGE:");
//     console.log(error?.message);

//     console.log("ERROR RESPONSE:");

//     console.log(
//       JSON.stringify(
//         error?.response?.data,
//         null,
//         2
//       )
//     );

//     console.log("=================================");

//     return res
//       .status(500)
//       .send("Internal Server Error");
//   }
// };

// handles when subcription paymnet is success
const subscriptionWebhook = async (req, res) => {
  try {
    /* =====================================================
       1. BASIC VALIDATION
    ===================================================== */
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET2;

    if (!signature || !webhookSecret) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature or secret",
      });
    }

    if (!req.rawBody) {
      console.error("Webhook rawBody missing");
      return res.status(400).json({
        success: false,
        message: "Raw body not available",
      });
    }

    /* =====================================================
       2. SIGNATURE VERIFICATION (CRITICAL)
    ===================================================== */
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody) // MUST be raw buffer
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid Razorpay webhook signature");
      return res.status(400).json({
        success: false,
        message: "Invalid Webhook Signature",
      });
    }

    /* =====================================================
       3. EVENT HANDLING
    ===================================================== */
    const event = req.body?.event;

    if (!event) {
      return res.status(200).json({ success: true });
    }

    switch (event) {
      /* -------- PAYMENT SUCCESS -------- */
      case "payment.captured":
      case "order.paid":
      case "payment_link.paid":
        await handlePaymentSuccessOnSubscription(req.body);
        break;

      /* -------- PAYMENT EXPIRED / FAILED -------- */
      case "payment_link.expired":
      case "payment.failed":
        await handleExpiredSubsPayment(req.body);
        break;

      /* -------- IGNORE OTHER EVENTS -------- */
      default:
        // Razorpay expects 2xx even if event is not handled
        return res.status(200).json({ success: true });
    }

    /* =====================================================
       4. ACKNOWLEDGE WEBHOOK
    ===================================================== */
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (error) {
    console.error("Subscription webhook processing error:", error);

    // Razorpay retries on non-2xx → return 200 to avoid infinite retries
    return res.status(200).json({
      success: true,
    });
  }
};


// triggers when razorpay account status changed
// const LinkedAccountStatusUpdateWebhook = async (req, res) => {
//   try {
//     const signature = req.headers["x-razorpay-signature"];
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET3;

//     /* ---------------- SIGNATURE VERIFICATION ---------------- */
//     const expectedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(req.body) // RAW BODY (Buffer)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       return res.status(400).send("Invalid signature");
//     }

//     const payload = JSON.parse(req.body.toString());
//     const entity = payload?.payload?.product?.entity;

//     const accountId = entity?.account_id;
//     if (!accountId) {
//       return res.status(400).send("Missing account_id");
//     }

//     /* ---------------- EVENT → STATUS MAP ---------------- */
//     const eventStatusMap = {
//       "product.route.activated": "activated",
//       "product.route.rejected": "rejected",
//       "product.route.under_review": "under_review",
//       "product.route.needs_clarification": "needs_clarification"
//     };

//     const newStatus = eventStatusMap[payload.event];
//     if (!newStatus) {
//       console.log("Unhandled Razorpay event:", payload.event);
//       return res.status(200).send("Unhandled event");
//     }

//     /* ---------------- DB IS SOURCE OF TRUTH ---------------- */
//     const user = await User.findOne({
//       razorpay_account_id: accountId
//     });

//     if (!user) {
//       // Not created by this platform → ignore safely
//       return res.status(200).send("Ignored");
//     }

//     /* ---------------- PREVENT STATUS REGRESSION ---------------- */
//     const currentStatus = user.razorpay_account_status || "failed";

//     if (
//       STATUS_PRIORITY[newStatus] <=
//       STATUS_PRIORITY[currentStatus]
//     ) {
//       return res.status(200).send("Stale event ignored");
//     }

//     /* ---------------- UPDATE STATUS ---------------- */
//     user.razorpay_account_status = newStatus;
//     await user.save();

//     /* ---------------- OPTIONAL ALERTS ---------------- */
//     await updateAlertsOnKyCResponse(payload);

//     return res.status(200).send("Webhook processed");
//   } catch (error) {
//     console.error("Webhook processing error:", error);
//     return res.status(500).send("Server error");
//   }
// };
const LinkedAccountStatusUpdateWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET3;

    /* ---------------- SIGNATURE VERIFICATION ---------------- */
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody) // MUST use raw buffer
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    console.log("Webhook payload received:", req.body);

    const payload = req.body;
    const entity = payload?.payload?.product?.entity;
    const accountId = entity?.account_id;

    if (!accountId) {
      return res.status(400).send("Missing account_id");
    }

    /* ---------------- EVENT → STATUS MAP ---------------- */
    const eventStatusMap = {
      "product.route.activated": "activated",
      "product.route.rejected": "rejected",
      "product.route.under_review": "under_review",
      "product.route.needs_clarification": "needs_clarification"
    };

    const newStatus = eventStatusMap[payload.event];
    if (!newStatus) {
      console.log("Unhandled Razorpay event:", payload.event);
      return res.status(200).send("Unhandled event");
    }

    /* ---------------- STATUS PRIORITY ---------------- */
    const STATUS_PRIORITY = {
      failed: 0,
      needs_clarification: 1,
      under_review: 2,
      rejected: 3,
      activated: 4
    };

    /* ---------------- DB IS SOURCE OF TRUTH ---------------- */
    const user = await User.findOne({ razorpay_account_id: accountId });
    if (!user) {
      return res.status(200).send("Ignored");
    }

    const currentStatus = user.razorpay_account_status || "failed";

    if (STATUS_PRIORITY[newStatus] <= STATUS_PRIORITY[currentStatus]) {
      console.log("Stale event ignored:", { currentStatus, newStatus });
      return res.status(200).send("Stale event ignored");
    }

    user.razorpay_account_status = newStatus;
    await user.save();

    await updateAlertsOnKyCResponse(payload);

    return res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).send("Server error");
  }
};



module.exports = {
  transferAmoutToLinkedAccWebhook,
  subscriptionWebhook,
  LinkedAccountStatusUpdateWebhook
}