require('dotenv').config();
const nodemailer = require('nodemailer');

const emailPort = Number(process.env.EMAIL_PORT) || 465;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: emailPort,
    secure: emailPort === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Sends secure patient portal onboarding email with a direct login link
 * @param {string} to - Recipient email address
 * @param {string} fullName - Patient full name
 * @param {string} patientId - Generated patient system ID
 */
const sendWelcomeEmail = async (to, fullName, patientId) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Missing EMAIL_USER or EMAIL_PASS in environment variables. Email skipped.");
            return null;
        }

        // Direct login link configured for your frontend client
        const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const portalLoginUrl = `${clientBaseUrl}/login?email=${encodeURIComponent(to)}`;

        const mailOptions = {
            from: `"Medicare Health System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Medicare Health Network | Secure Patient Portal Access',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Medicare Portal Activation</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
                    <div style="max-width: 620px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 30px; text-align: left;">
                            <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                                Digital Health Card Network
                            </span>
                            <h1 style="color: #ffffff; margin: 12px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                                Medicare Health System
                            </h1>
                            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">
                                Patient Profile & Identity Registration Confirmation
                            </p>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 32px 30px;">
                            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px 0;">
                                Dear <strong>${fullName}</strong>,
                            </p>
                            <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                                Your national healthcare record profile has been successfully initialized in our secure registry. You can now access your diagnostic history, digital health smart card, and hospital appointments.
                            </p>

                            <!-- Credentials Box -->
                            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                                <div style="margin-bottom: 12px;">
                                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block;">Permanent Patient ID</span>
                                    <span style="font-size: 16px; font-family: monospace; font-weight: 700; color: #0284c7;">${patientId}</span>
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block;">Portal Username</span>
                                    <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${to}</span>
                                </div>
                                <div>
                                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block;">Temporary Access Key</span>
                                    <span style="font-size: 13px; font-weight: 600; color: #0f172a;">
                                        Your Date of Birth in <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a; font-size: 12px;">YYYYMMDD</code> format
                                    </span>
                                    <span style="display: block; font-size: 12px; color: #64748b; margin-top: 3px;">
                                        (e.g., If born on 15 March 1998, enter <strong>19980315</strong>)
                                    </span>
                                </div>
                            </div>

                            <!-- Call to Action Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${portalLoginUrl}" style="display: inline-block; background-color: #078a72; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 10px rgba(7, 138, 114, 0.25);">
                                    Log In to Patient Portal &rarr;
                                </a>
                                <p style="font-size: 12px; color: #94a3b8; margin: 10px 0 0 0;">
                                    Direct link: <a href="${portalLoginUrl}" style="color: #0284c7; word-break: break-all;">${portalLoginUrl}</a>
                                </p>
                            </div>

                            <!-- Security Advisory -->
                            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 24px;">
                                <strong style="color: #b45309; font-size: 13px; display: block; margin-bottom: 2px;">Security Protocol Notice:</strong>
                                <span style="font-size: 12px; color: #92400e; line-height: 18px; display: block;">
                                    For medical record confidentiality, update your password immediately after logging in. Never share your Patient ID or verification credentials with third parties.
                                </span>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 18px;">
                            <p style="margin: 0;">This is an encrypted notification from the Medicare Health Network Hospital Management System.</p>
                            <p style="margin: 4px 0 0 0;">Colombo, Western Province, Sri Lanka &bull; Automated System Node &bull; Do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Secure Portal Email sent to ${to}:`, info.messageId);
        return info;
    } catch (error) {
        console.error("⚠️ Nodemailer Email Error Details:", error);
        return null;
    }
};

module.exports = sendWelcomeEmail;