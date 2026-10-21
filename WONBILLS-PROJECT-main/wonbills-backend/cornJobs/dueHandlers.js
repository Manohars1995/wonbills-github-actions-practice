const mongoose = require("mongoose");
const Payment = require("../models/payment");
const Invoice = require("../models/invoice");
const Client = require("../models/client");
const User = require("../models/users");

const { getVendorAndClientDetails, prepareInvoiceData } = require("../utils/razorpay/payment-helpers");
const { sendPaymentReminderEmail, SendPaymentOverDueReminderEmail } = require("../utils/EmailUtils");

// FUNCTION TO SEND REMINDER EMAIL ------ NOTIFICATION
const SendPaymentDueReminderEmail = async (payment) => {
    const details = await getVendorAndClientDetails(payment.user_id, payment.client_id, payment.payment_id);
    const { invoicePdfData } = await prepareInvoiceData(payment, details);
    await sendPaymentReminderEmail(payment, invoicePdfData, details);
};


// CHECKING PAYMENTS DUE TO SEND EMAIL NOTIFICATIONS ------ NOTIFICATION
const CheckPaymentsDue = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        const payments = await Payment.aggregate([
            // 1️⃣ Filter payments
            {
                $match: {
                    payment_state: "requested",
                    payment_due_date: {
                        $gte: today,
                        $lte: threeDaysLater
                    }
                }
            },

            // 2️⃣ Join invoices
            {
                $lookup: {
                    from: "invoices",
                    localField: "invoice_id",
                    foreignField: "invoice_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },

            // 3️⃣ Join clients
            {
                $lookup: {
                    from: "clients",
                    localField: "invoice.client",
                    foreignField: "client_id",
                    as: "client"
                }
            },
            { $unwind: "$client" },

            // 4️⃣ Join users (vendors)
            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "custom_id",
                    as: "vendor"
                }
            },
            { $unwind: "$vendor" },

            // 5️⃣ Compute days_remaining
            {
                $addFields: {
                    days_remaining: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$payment_due_date", today] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            },

            // 6️⃣ Select required fields
            {
                $project: {
                    payment_id: 1,
                    payment_due_date: 1,
                    payment_amount: 1,
                    days_remaining: 1,

                    client_id: "$invoice.client",
                    custom_invoice_id: "$invoice.custom_invoice_id",

                    client_email: "$client.email",

                    vendor_company_details: "$vendor.company_details",
                    user_id: "$vendor.custom_id",
                    alert_status: "$vendor.alerts"
                }
            }
        ]);

        if (!payments.length) return;

        const sendEmailPromises = payments.map((payment) => {
            if (payment.alert_status === true) {
                return SendPaymentDueReminderEmail(payment).catch((error) =>
                    console.error(
                        `Failed to send reminder for Payment ID: ${payment.payment_id}`,
                        error.message
                    )
                );
            }
        });

        await Promise.all(sendEmailPromises);

    } catch (error) {
        console.error("Error checking due payments:", error.message);
    }
};


// FUNCTION TO CHECK PAYMENT OVERDUES ------ NOTIFICATION
const CheckPaymentsOverDue = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const payments = await Payment.aggregate([
            {
                $match: {
                    payment_state: "requested",
                    payment_due_date: { $lt: today }
                }
            },

            {
                $lookup: {
                    from: "invoices",
                    localField: "invoice_id",
                    foreignField: "invoice_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },

            {
                $lookup: {
                    from: "clients",
                    localField: "invoice.client",
                    foreignField: "client_id",
                    as: "client"
                }
            },
            { $unwind: "$client" },

            {
                $lookup: {
                    from: "users",
                    localField: "vendor_id",
                    foreignField: "custom_id",
                    as: "vendor"
                }
            },
            { $unwind: "$vendor" },

            {
                $addFields: {
                    days_overdue: {
                        $ceil: {
                            $divide: [
                                { $subtract: [today, "$payment_due_date"] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            },

            {
                $project: {
                    payment_id: 1,
                    payment_due_date: 1,
                    payment_amount: 1,
                    days_overdue: 1,

                    client_id: "$invoice.client",
                    client_email: "$client.email",

                    vendor_company_details: "$vendor.company_details",
                    alert_status: "$vendor.alerts"
                }
            }
        ]);

        if (!payments.length) return;

        await Promise.all(
            payments.map((payment) =>
                payment.alert_status === true
                    ? SendPaymentOverDueReminderEmail(payment)
                    : null
            )
        );

    } catch (error) {
        console.error("Error checking overdue payments:", error.message);
    }
};


module.exports = {
    CheckPaymentsDue,
    CheckPaymentsOverDue
}