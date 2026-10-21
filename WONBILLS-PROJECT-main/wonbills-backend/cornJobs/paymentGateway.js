const { razorpay } = require("../utils/razorpay/razorpay-helpers");
const {
  getVendorAndClientDetails,
} = require("../utils/razorpay/payment-helpers");
const { sendPaymentEmail } = require("../utils/EmailUtils");

// FUNCTION TO SEND PAYMENT LINK TO CLIENT BY THE SCHEDULED TIME
const createPaymentLink = async (clientID, paymentDetails) => {
  try {
    const UserID = paymentDetails?.vendor_id; // Vendor's user ID

    if (!paymentDetails) {
      return res.status(404).json({ error: "Payment details not found" });
    }

    // Fetch vendor and client details
    const ClientAndVendorDetails = await getVendorAndClientDetails(
      UserID,
      clientID,
      paymentDetails.payment_id
    );
    if (!ClientAndVendorDetails) {
      return res
        .status(404)
        .json({ error: "Vendor or client details not found" });
    }

    const {
      vendor_name,
      vendor_email,
      vendor_contact,
      razorpay_account_id,
      company_details,
      currency_preference,
      client_name,
      client_email,
      client_contact,
      invoice_id,
      due_date,
      custom_payment_id,
      custom_invoice_id
    } = ClientAndVendorDetails;

    // platform fee percentage (1%)
    const platformFeePercentage = 0;
    const transactionFeePercentage = 4; // 3% Razorpay transaction fee (can vary based on payment method)

    // Gross amount is the price before any fees
    let grossAmount = parseFloat(paymentDetails?.invoice_amount); // The original amount to be paid
    if (isNaN(grossAmount)) {
      return res.status(400).json({ error: "Invalid gross amount" });
    }

    let totalAmount = grossAmount; // Total amount that the client will pay
    let transactionFee = 0;

    // Calculate platform fee (1% of gross amount)
    let platformFee = (grossAmount * platformFeePercentage) / 100;

    // Determine who pays the transaction fee
    if (paymentDetails?.commission_by_customer === "true") {
      // Client pays both the transaction fee and platform fee
      // Transaction fee is calculated on the total amount the client pays (grossAmount + platformFee + transactionFee)
      const extraFee = (grossAmount * 3) / 100;
      totalAmount += extraFee;
    }

    let PlatformExtraFees;
    PlatformExtraFees = (grossAmount * 3) / 100;

    // Convert total amount to paise (Razorpay requires paise)
    const amountInPaise = Math.round(totalAmount * 100);
    const Currency = currency_preference.toUpperCase();

    // Create payment link using Razorpay API
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise, // Convert total amount to paise (100 paise = 1 INR)
      currency: Currency,
      accept_partial: false,
      description: `Payment for Invoice ${custom_invoice_id} from ${company_details?.company_name}`,
      customer: {
        name: client_name,
        email: client_email,
        contact: client_contact.number,
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      callback_url: "https://api.wonbills.com/razorpay-webhook", // callback URL after payment WEBHOOK
      callback_method: "get",
      notes: {
        vendor_id: UserID, // Vendor's user_id from the database
        client_id: clientID, // Client's user_id from the database
        client_name: paymentDetails?.client_name,
        user_account_id: razorpay_account_id, // Vendor's Razorpay account ID
        gross_amount: grossAmount * 100, // Gross amount before fees (in paise)
        total_amount: amountInPaise, // Total amount client pays (in paise)
        transaction_fee: transactionFee * 100, // Transaction fee (in paise)
        platform_fee: platformFee * 100, // Platform fee (in paise)
        totalFee: PlatformExtraFees,
        currency: Currency, // Currency for payment
        purchase_order_id: paymentDetails.payment_id, // Payment ID in Wonbills
        invoice_id: paymentDetails.invoice_id,
      },
    });

    const Email = await sendPaymentEmail(
      ClientAndVendorDetails,
      paymentLink.short_url,
      amountInPaise,
      paymentDetails.payment_id,
      due_date
    );

    // Return the payment link URL to the client
    return { id: paymentLink.id, short_url: paymentLink.short_url };
  } catch (error) {
    console.error(
      "Error creating payment link:",
      error.response ? error.response.data : error.message
    );
    return res
      .status(500)
      .json({ error: "Failed to create payment link", details: error.message });
  }
};

module.exports = {
  createPaymentLink,
};
