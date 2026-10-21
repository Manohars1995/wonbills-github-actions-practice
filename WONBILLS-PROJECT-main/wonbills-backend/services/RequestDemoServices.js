// services/RequestDemoServices.js

const { EmailTransporter } = require("../utils/email-transporter");

const requestDemoWonBills = async (
    name,
    contact,
    email,
    organization,
    time,
    source,
    matter
) => {
    console.log(name, contact, email, organization, time, source, matter);
    const row = (label, value) => `
    <tr>
        <td style="padding:10px 0;font-weight:600;color:#333;width:40%;">
            ${label}
        </td>
        <td style="padding:10px 0;color:#2563EB;font-weight:500;">
            ${value || "-"}
        </td>
    </tr>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "sales@nowitservices.com",
        subject: 'WONBILLS : New Enquiry Received',
        html: `
        <div style="font-family: 'Segoe UI', sans-serif; background:#f4f6f8; padding:30px;">
            <div style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                <div style="background:linear-gradient(135deg,#2563EB,#1d4ed8);padding:22px 28px;color:#fff;">
                    <h2 style="margin:0;font-size:20px;"> WON Bills </h2>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">
                        A new enquiry has been submitted
                    </p>
                </div>
                <div style="padding:28px;">
                    <p style="font-size:15px;color:#333;margin-bottom:18px;">Hello Team,</p>
                    <p style="font-size:14px;color:#555;margin-bottom:24px;">
                        A user has submitted a demo request. Here are the details:
                    </p>
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        ${row("Full Name", name)}
                        ${row("Email", email)}
                        ${row("Contact", contact)}
                        ${row("Organisation", organization)}
                        ${row("Preferred Time", time)}
                        ${row("Source", source)}
                        ${row("Looking For", matter)}
                    </table>
                    <p style="margin-top:24px;font-size:13px;color:#777;">
                        ⏱ Please follow up with the user as soon as possible.
                    </p>
                </div>
                <div style="background:#eff6ff;padding:14px;text-align:center;font-size:12px;color:#888;">
                    © ${new Date().getFullYear()} WON Bills. All rights reserved.
                </div>
            </div>
        </div>
        `
    };

    await EmailTransporter.sendMail(mailOptions);
};

module.exports = { requestDemoWonBills };