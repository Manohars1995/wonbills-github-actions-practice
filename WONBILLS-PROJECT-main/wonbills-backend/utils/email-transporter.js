const nodemailer = require("nodemailer");


// EMAIL TRANSPORTER SETUP
const EmailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = {
    EmailTransporter
}