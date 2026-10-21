const path = require("path");
const fs = require("fs");
const { generateInvoicePDF1 } = require("../pdfTemplates/pdfTemp1");
const {
  fetchClientAndVendorDetails,
  prepareInvoiceData2,
} = require("./razorpay/payment-helpers");
const { EmailTransporter } = require("./email-transporter");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitize = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sendOTPEmail = async (email, otp) => {
  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "otp-temp.html"
  );
  let otpEmailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

  otpEmailTemplate = otpEmailTemplate.replace(/{{otp}}/g, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "WONbills: Your One-Time Password (OTP)",
    html: otpEmailTemplate,
  };

  return EmailTransporter.sendMail(mailOptions);
};

const welcomeMail = async (vendorName, vendorMail) => {
  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "welcome-temp.html"
  );
  let welcomeEmailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

  // Replace placeholders in the template with dynamic data
  welcomeEmailTemplate = welcomeEmailTemplate.replace(
    /{{vendor_name}}/g,
    vendorName
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: vendorMail,
    subject: "🎉 Welcome to WONBills – Simplify Your Payments!",
    html: welcomeEmailTemplate,
  };

  try {
    const info = await EmailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const PaymentReceivedEmailOffline = async (
  clientEmail,
  clientName,
  PurchaseOrderID,
  amount,
  vendorDetails,
  invoice_id,
  vendor_contact_number,
  vendorEmail,
  currency_preference,
  outputPath
) => {
  try {
    // Format amount using internationalization API
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency_preference,
    }).format(amount);

    // Construct vendor contact number
    const contact_num = vendor_contact_number
      ? `+${vendor_contact_number.dialCode}${vendor_contact_number.number}`
      : "";

    const vendor_name = vendorDetails.company_name || "Vendor";

    // Format date
    const formatted_date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Read email template
    const emailTemplatePath = path.join(
      __dirname,
      "../emailTemps",
      "payment-received-email-template-offline.html"
    );
    let paymentReceivedEmailTemp = fs.readFileSync(emailTemplatePath, "utf-8");

    // Replace placeholders with actual values
    const emailContent = paymentReceivedEmailTemp
      .replace(/{{client_name}}/g, clientName)
      .replace(/{{invoice_id}}/g, invoice_id)
      .replace(/{{amount}}/g, formattedAmount)
      .replace(/{{payment_date}}/g, formatted_date)
      .replace(/{{vendor_name}}/g, vendor_name)
      .replace(/{{vendor_contact}}/g, contact_num)
      .replace(/{{vendor_email}}/g, vendorEmail || "");

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: "WONBILLS : Payment Received",
      html: emailContent,
      attachments: [
        {
          filename: `Invoice_${invoice_id}.pdf`,
          path: outputPath,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    const info = await EmailTransporter.sendMail(mailOptions);

    // Delete PDF after sending email
    fs.unlink(outputPath, (err) => {
      if (err) {
        console.error(`Failed to delete PDF: ${err.message}`);
      }
    });
  } catch (error) {
    console.error(
      `Error sending email for Payment ID: ${PurchaseOrderID}`,
      error.message
    );
  }
};

const sendPaymentEmail = async (
  clientAndVendorDetails,
  paymentLink,
  amountInPaise,
  purchase_id,
  due_date
) => {
  try {
    const {
      vendor_email,
      vendor_contact = { number: "N/A" },
      company_details = {},
      currency_preference = "INR",
      client_name,
      client_email,
      client_contact = { number: "N/A" },
      invoice_id,
      custom_invoice_id,
      invoice_items = [],
      address = {},
      custom_payment_id
    } = clientAndVendorDetails;
console.log("Client and Vendor Details for Payment Email:", clientAndVendorDetails);
    const vendor_name = company_details?.name
    // Format amount with currency preference
    const amount = (amountInPaise / 100).toFixed(2); // Convert paise to INR
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency_preference,
    }).format(amount);

    // Get formatted current date
    const readableDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!client_email || !paymentLink || !amount) {
      throw new Error(
        "Missing required information: client_email, paymentLink, or amount."
      );
    }

    // Extract invoice details
    const dateOnly = new Date().toISOString().split("T")[0];
    const totalInvoiceAmount = invoice_items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const formattedTotalAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency_preference,
    }).format(totalInvoiceAmount);

    // Prepare invoice PDF data
    const invoicePdfData = {
      customerName: {
        name: client_name || "",
        address: address.street_name || "",
        city: address.city || "",
        email: client_email || "",
        phone: client_contact.number || "",
      },
      invoice: {
        ID: custom_invoice_id || "",
        date: dateOnly,
      },
      items: invoice_items.map((item) => ({
        reference: item?.custom_id,
        name: item.item_name,
        unitPrice: parseFloat(item.value),
        tax: parseFloat(item.taxation),
        discount: parseFloat(item.discount),
        finalPrice: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10),
        total: parseFloat(item.quantity * item.price),
      })),
      grandTotal: formattedAmount,
      currencyType: "₹",
    };

    // Generate invoice PDF
    const pdfPath = await generateInvoicePDF1(invoicePdfData);

    // Read email template
    const emailTemplatePath = path.join(
      __dirname,
      "../emailTemps",
      "payment-email-template1.html"
    );
    let paymentEmailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    // Replace placeholders in email template
    paymentEmailTemplate = paymentEmailTemplate
      .replace(/{{client_name}}/g, client_name)
      .replace(/{{purchase_id}}/g, custom_payment_id)
      .replace(/{{vendor_name}}/g, vendor_name)
      .replace(/{{formattedAmount}}/g, formattedAmount)
      .replace(/{{due_date}}/g, due_date)
      .replace(/{{invoice_id}}/g, custom_invoice_id)
      .replace(/{{currentDate}}/g, readableDate)
      .replace(/{{paymentLink}}/g, paymentLink)
      .replace(/{{company_name}}/g, company_details.company_name || "")
      .replace(/{{vendor_contact}}/g, vendor_contact || "")
      .replace(/{{vendor_email}}/g, vendor_email);

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client_email,
      // to:"sivakumar.erugu@nowitservices.com",
      subject: `Payment Request for Invoice #${custom_invoice_id}`,
      html: paymentEmailTemplate,
      attachments: [
        {
          filename: `Invoice_${invoice_id}.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    await EmailTransporter.sendMail(mailOptions);

    // Delete PDF after sending email
    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.error(`Failed to delete PDF: ${err.message}`);
      }
    });

  } catch (error) {
    console.log("Error sending payment email: @ Email utils", error.message);
    throw error; // Rethrow for further handling
  }
};

//generate email template for payment remainder
const generateEmailTemplate = (payment, vendor_name) => {
  const { client_name, invoice_id, payment_due_date, invoice_amount, custom_invoice_id } = payment;

  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "payment-due-temp.html"
  );
  let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

  return emailTemplate
    .replace(/{{client_name}}/g, sanitize(client_name))
    .replace(/{{invoice_id}}/g, custom_invoice_id)
    .replace(/{{due_date}}/g, payment_due_date)
    .replace(/{{due_amount}}/g, invoice_amount)
    .replace(/{{vendor_name}}/g, vendor_name);
};

//send email remainder to client
const sendPaymentReminderEmail = async (payment, invoicePdfData, details) => {
  const {
    payment_due_date,
    payment_id,
    invoice_id,
    client_email,
    custom_invoice_id,
    custom_payment_id,
    vendor_company_details,
  } = payment;

  if (!payment_due_date || !payment_id || !invoice_id || !client_email) {
    console.error("Missing required payment details:", payment);
    return;
  }

  const pdfPath = await generateInvoicePDF1({ ...invoicePdfData, custom_invoice_id });
  const vendor_name = vendor_company_details.company_name;
  const emailTemplate = generateEmailTemplate(payment, vendor_name);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: client_email,
    subject: `Friendly Reminder: Payment for Invoice ${custom_invoice_id} is due on ${payment_due_date}. Don’t miss it!`,
    html: emailTemplate,
    attachments: [
      {
        filename: `Invoice_${invoice_id}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await EmailTransporter.sendMail(mailOptions);
    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.error(`Failed to delete PDF: ${err.message}`);
      }
    });
  } catch (error) {
    console.error(
      `Error sending email for Payment ID: ${payment_id}`,
      error.message
    );
  }
};

// FUNCTION TO SEND EMAIL WHEN THE PAYMENT IS OVERDUE ------ NOTIFICATION
const SendPaymentOverDueReminderEmail = async (payment) => {
  const {
    payment_due_date,
    payment_id,
    invoice_id,
    client_name,
    invoice_amount,
    vendor_id,
    days_exceeded,
    client_email,
    vendor_company_details,
    custom_payment_id
  } = payment;

  if (
    !payment_due_date ||
    !payment_id ||
    !invoice_id ||
    !client_email ||
    !client_name ||
    !invoice_amount
  ) {
    console.error("Missing required payment details:", payment);
    return;
  }

  const sanitizedClientName = sanitize(client_name);


  const [rows] = await db.query('SELECT custom_invoice_id FROM invoices WHERE invoice_id = ?', [invoice_id]);
  const invoiceData = rows.length > 0 ? rows[0] : null;
  const custom_invoice_id = invoiceData.custom_invoice_id;

  const No_of_days =
    days_exceeded === 1
      ? `This is a friendly reminder that your payment exceeds the Due date.`
      : `This is a friendly reminder that your payment is overdue by ${days_exceeded} days.`;

  const vendor_name = vendor_company_details.company_name;
  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "payment-over-due-temp.html"
  );
  let OverDeEmailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

  OverDeEmailTemplate = OverDeEmailTemplate.replace(
    /{{client_name}}/g,
    sanitizedClientName
  )
    .replace(/{{invoice_id}}/g, custom_invoice_id)
    .replace(/{{due_date}}/g, payment_due_date)
    .replace(/{{due_amount}}/g, invoice_amount)
    .replace(/{{vendor_name}}/g, vendor_name);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: client_email,
    subject: "Payment Overdue – Immediate Action Required",
    html: OverDeEmailTemplate,
  };

  try {
    const info = await EmailTransporter.sendMail(mailOptions);

  } catch (error) {
    console.error(
      `Error sending email for Payment ID: ${payment_id}`,
      error.message
    );
  }
};

// FUNCTION TO SEND EMAIL NOTIFICATIONS ON LOW STOCK
const sendLowStockEmail = async (lowStockProducts, userEmail) => {
  const productRows = lowStockProducts
    .map((product) => {
      return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">${product.product_id}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">${product.in_stock}</td>
            </tr>
        `;
    })
    .join("");

  const htmlContent = `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                h2 {
                    text-align: center;
                    color: #262c40;
                }
                table {
                    width: 100%;
                    border-collapse: separate; /* Allow border radius */
                    border-spacing: 0; /* Remove gaps between cells */
                    border: 1px solid #ddd;
                    border-radius: 10px; /* Rounded corners for the table */
                    overflow: hidden; /* Ensure rounded corners */
                    margin: 20px auto; /* Center table */
                    background-color: #fff; /* Table background */
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #262c40;
                    color: #fff;
                }
                tr:first-child th {
                    border-top-left-radius: 10px; /* Top corners */
                    border-top-right-radius: 10px;
                }
                tr:last-child td {
                    border-bottom-left-radius: 10px; /* Bottom corners */
                    border-bottom-right-radius: 10px;
                }
                p {
                    text-align: center;
                    color: #555;
                }
                img {
                    display: block;
                    margin: 10px auto;
                    width: 100px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <h2>Low Stock Notification</h2>
            <p>The following items are running low in stock:</p>
            <table>
                <thead>
                    <tr>
                        <th>Item ID</th>
                        <th>In Stock</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                </tbody>
            </table>
            <p>Please restock these items as soon as possible.</p>
            <div>
                <p>Thank you,</p>
                <p>Team WonBills</p>
                <img src="https://res.cloudinary.com/dca9sij3n/image/upload/v1732171827/yzqkragh8rdbbwg9pi4g.png" alt="WonBills Logo" />
            </div>
        </body>
    </html>
    `;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: userEmail, // Recipient's email
    subject: "Low Stock Notification", // Subject line
    text: `The following products are low in stock:\n\n${lowStockProducts
      .map((p) => `Product Number: ${p.product_id}, In Stock: ${p.in_stock}`)
      .join("\n")}`, // Fallback plain text
    html: htmlContent, // HTML body
  };

  // Send the email
  try {
    await EmailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending low-stock email:", error);
  }
};

const sendPaymentReceivedEmail = async (
  clientEmail,
  clientName,
  PurchaseOrderID,
  amount,
  vendorDetails,
  invoice_id,
  transaction_id,
  currency_preference,
  outputPath
) => {
  const sanitizedClientName = sanitize(clientName);
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency_preference,
  }).format(amount);

  const vendor_name = vendorDetails?.company_name;
  const contact_num = `+${vendor_contact_number.dialCode}${vendor_contact_number.number}`;
  const formatted_date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "payment-received-email-template.html"
  );
  let paymentReceivedEmailTemp = fs.readFileSync(emailTemplatePath, "utf-8");

  paymentReceivedEmailTemp = paymentReceivedEmailTemp
    .replace(/{{client_name}}/g, sanitizedClientName || "")
    .replace(/{{invoice_id}}/g, invoice_id || "")
    .replace(/{{amount}}/g, formattedAmount || "")
    .replace(/{{payment_date}}/g, formatted_date || "")
    .replace(/{{transaction_id}}/g, transaction_id || "")
    .replace(/{{vendor_name}}/g, vendor_name || "")
    .replace(/{{vendor_contact}}/g, contact_num || "")
    .replace(/{{vendor_email}}/g, vendor_email || "");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: "WONBILLS : Payment Received",
    html: paymentReceivedEmailTemp,
    attachments: [
      {
        filename: `Invoice_${invoice_id}.pdf`,
        path: outputPath,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await EmailTransporter.sendMail(mailOptions);
    fs.unlink(outputPath, (err) => {
      if (err) {
        console.error(`Failed to delete PDF: ${err.message}`);
      }
    });
  } catch (error) {
    console.error(
      `Error sending email for Payment ID: ${PurchaseOrderID}`,
      error.message
    );
  }
};

const updateClient = async (
  PurchaseOrderID,
  amount,
  VendorId,
  transactionID
) => {
  try {
    const clientDetails = await fetchClientAndVendorDetails(PurchaseOrderID);
    if (!clientDetails) {
      console.error("No data found for the given PurchaseOrderID");
      return;
    }

    const {
      client_email,
      client_name,
      vendor_company_details,
      vendor_email,
      invoice_id,
      currency_preference,
      alert_status,
    } = clientDetails;

    if (alert_status !== "true") {
      return;
    }

    const invoiceData = prepareInvoiceData2(clientDetails);
    if (!invoiceData) {
      console.error("Error preparing invoice data.");
      return;
    }

    const outputPath = await generateInvoicePDF1(invoiceData);

    await sendPaymentReceivedEmail(
      client_email,
      client_name,
      PurchaseOrderID,
      amount,
      vendor_company_details,
      invoice_id,
      transactionID,
      currency_preference,
      outputPath
    );
  } catch (error) {
    console.error("Error updating client:", error);
  }
};

const sendSubscriptionExpiringEmail = async (userEmail, userName, expiryDate) => {
  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "subscription-expiring.html"
  );

  let sendSubscriptionExpiringEmailTemp = fs.readFileSync(
    emailTemplatePath,
    "utf-8"
  )

  sendSubscriptionExpiringEmailTemp = sendSubscriptionExpiringEmailTemp
    .replace(/{{user_name}}/g, userName)
    .replace(/{{expiry_date}}/g, expiryDate);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '⏳ Your WON Bills Subscription is About to Expire!',
    html: sendSubscriptionExpiringEmailTemp,
  }

  try {
    await EmailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending subscription expiring email:', error.message);
  }

}

const sendFreeTrailExpiredEmail = async (userEmail, userName) => {
  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "free-trail-expired.html"
  );

  let FreeTrailExpiredEmailTemp = fs.readFileSync(
    emailTemplatePath,
    "utf-8"
  )

  FreeTrailExpiredEmailTemp = FreeTrailExpiredEmailTemp
    .replace(/{{user_name}}/g, userName);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your WON Bills Trial Has Ended — Don’t Miss Out!',
    html: FreeTrailExpiredEmailTemp,
  }

  try {
    await EmailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending subscription expiring email:', error.message);
  }
}

const sendRenewalSuccessfulEmail = async (userDetails) => {
  const { userEmail, userName, userId, renewedDate, expiryDate, renewalAmount } = userDetails;
  if (!userEmail || !userName || !userId || !renewedDate || !expiryDate || !renewalAmount) {
    console.error("Missing required user details:", userDetails);
    return;
  };

  const emailTemplatePath = path.join(
    __dirname,
    "../emailTemps",
    "renewal-successful.html"
  );

  let RenewalSuccessfulEmailTemp = fs.readFileSync(
    emailTemplatePath,
    "utf-8"
  )

  RenewalSuccessfulEmailTemp = RenewalSuccessfulEmailTemp
    .replace(/{{user_name}}/g, userName)
    .replace(/{{user_id}}/g, userId)
    .replace(/{{renewed_date}}/g, renewedDate)
    .replace(/{{expiry_date}}/g, expiryDate)
    .replace(/{{renewal_amount}}/g, renewalAmount);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Won Bills Trial Has Ended — Don’t Miss Out!',
    html: RenewalSuccessfulEmailTemp,
  }

  try {
    await EmailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending subscription expiring email:', error.message);
  }
}


module.exports = {
  generateOTP,
  sendOTPEmail,
  welcomeMail,
  PaymentReceivedEmailOffline,
  sendPaymentEmail,
  sendPaymentReminderEmail,
  SendPaymentOverDueReminderEmail,
  sendLowStockEmail,
  updateClient,
  sendSubscriptionExpiringEmail,
  sendFreeTrailExpiredEmail,
  sendRenewalSuccessfulEmail
};
