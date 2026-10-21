const { sendPaymentEmail } = require("../utils/EmailUtils");
const { getVendorAndClientDetails } = require("../utils/razorpay/payment-helpers");
const { razorpay } = require("../utils/razorpay/razorpay-helpers");
const Payment = require("../models/payment");

const createOnlinePaymentLink = async ({
    vendorId,
    client_id,
    gross_amount,
    clientPaysFees,
    payment_id,        // Payment _id
    invoice_id,
    due_date,
    custom_payment_id,
    session   
}) => {
    if (!vendorId || !client_id || !gross_amount || !payment_id || !invoice_id) {
        throw new Error("Missing required fields for payment link creation");
    }

    const grossAmount = Number(gross_amount);
    if (isNaN(grossAmount)) {
        throw new Error("Invalid gross_amount");
    }

    /* ---------------- FETCH DETAILS ---------------- */
    const details = await getVendorAndClientDetails(
        vendorId,
        payment_id,
        session   
    );
console.log("Fetched details for payment link creation:", details);

    const {
        vendor_email,
        vendor_contact,
        razorpay_account_id,
        company_details,
        currency_preference,
        client_name,
        client_email,
        client_contact,
        custom_invoice_id
    } = details;

    /* ---------------- FEES CALCULATION ---------------- */
    const extraFeePercentage = 3;
    let totalAmount = grossAmount;

    if (clientPaysFees === true) {
        totalAmount += (grossAmount * extraFeePercentage) / 100;
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const currency = currency_preference?.toUpperCase() || "INR";

    /* ---------------- CREATE PAYMENT LINK ---------------- */
    const paymentLink = await razorpay.paymentLink.create({
        amount: amountInPaise,
        currency,
        accept_partial: false,
        description: `WONBILLS: Payment for Invoice ${custom_invoice_id} from ${company_details?.name}`,
        customer: {
            name: client_name,
            email: client_email,
            contact: client_contact?.number || ""
        },
        notify: { sms: true, email: false },
        reminder_enable: true,
        callback_method: "get",
        notes: {
            vendor_id: vendorId,
            client_id,
            client_name,
            vendor_rzp_linked_account_id: razorpay_account_id,
            gross_amount: grossAmount * 100,
            total_amount: totalAmount * 100,
            currency,
            payment_id,
            invoice_id,
            app: "WON_BILLS"
        }
    });

    /* ---------------- SEND EMAIL ---------------- */
    await sendPaymentEmail(
        details,
        paymentLink.short_url,
        amountInPaise,
        custom_payment_id,
        due_date
    );

    /* ---------------- UPDATE PAYMENT ---------------- */
    await Payment.findByIdAndUpdate(payment_id, {
        payment_link_id: paymentLink.id
    });

    return {
        payment_link: paymentLink.short_url,
        email: client_email,
        razorpay_payment_link_id: paymentLink.id
    };
};


module.exports = {
    createOnlinePaymentLink
}