const moment = require("moment");
const Payment = require("../models/payment");
const Invoice = require("../models/invoice");
const Client = require("../models/client");

const { createPaymentLink } = require("./paymentGateway");

// CHECK FOR DUE PAYMENTS AND SEND REMINDER EMAILS ------ NOTIFICATION
const processPayments = async () => {
  try {
    const today = moment().startOf("day").toDate();
    const tomorrow = moment(today).add(1, "day").toDate();

    // Fetch scheduled payments for today
    const payments = await Payment.aggregate([
      {
        $match: {
          payment_state: "scheduled",
          status: "active",
          schedule_date: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },

      // Join invoices
      {
        $lookup: {
          from: "invoices",
          localField: "invoice_id",
          foreignField: "invoice_id",
          as: "invoice",
        },
      },
      { $unwind: "$invoice" },

      // Join clients
      {
        $lookup: {
          from: "clients",
          localField: "invoice.client",
          foreignField: "client_id",
          as: "client",
        },
      },
      { $unwind: "$client" },

      // Pick only what we need
      {
        $project: {
          payment_id: 1,
          invoice_id: 1,
          schedule_date: 1,
          payment_state: 1,
          status: 1,

          client_id: "$invoice.client",
          client_email: "$client.email",
        },
      },
    ]);

    if (!payments.length) return;

    // Process payments sequentially (safe for API calls)
    for (const payment of payments) {
      try {
        const paymentLinkDetails = await createPaymentLink(
          payment.client_id,
          payment,
        );

        await Payment.updateOne(
          { payment_id: payment.payment_id },
          {
            $set: {
              payment_state: "requested",
              payment_link_id: paymentLinkDetails?.id,
            },
          },
        );
      } catch (err) {
        console.error(
          `Error processing payment ID ${payment.payment_id}:`,
          err.message,
        );
      }
    }
  } catch (err) {
    console.error("Error processing payments:", err.message);
  }
};

module.exports = {
  processPayments,
};
