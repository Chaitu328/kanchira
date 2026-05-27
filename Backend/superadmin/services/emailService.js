const nodemailer = require("nodemailer");

/**
 * Create transporter fresh each time to always pick up latest env vars
 */
const createTransporter = () => {
  console.log("[EmailService] GMAIL_USER:", process.env.GMAIL_USER);
  console.log("[EmailService] APP_PASS length:", process.env.GMAIL_APP_PASSWORD?.length);

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * OTP email HTML template
 */
const otpEmailTemplate = (otp, name = "User") => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;
              background: #ffffff; border-radius: 10px; overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                padding: 30px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">
        🔐 OTP Verification
      </h1>
      <p style="color: #a0aec0; margin: 8px 0 0; font-size: 13px;">Password Reset Request</p>
    </div>
    <div style="padding: 36px 40px;">
      <p style="color: #2d3748; font-size: 15px; margin: 0 0 12px;">
        Hello, <strong>${name}</strong>
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
        Use the OTP below to reset your password.
        <strong>This code expires in 5 minutes.</strong>
      </p>
      <div style="background: #f7fafc; border: 2px dashed #e2e8f0; border-radius: 10px;
                  padding: 24px; text-align: center; margin-bottom: 28px;">
        <p style="color: #718096; font-size: 12px; margin: 0 0 8px; text-transform: uppercase;
                   letter-spacing: 2px;">Your OTP Code</p>
        <span style="font-size: 42px; font-weight: 800; letter-spacing: 14px; color: #1a1a2e;
                     font-family: 'Courier New', monospace;">${otp}</span>
      </div>
      <p style="color: #718096; font-size: 13px;">
        ⚠️ <strong>Do not share this OTP</strong> with anyone.
      </p>
    </div>
    <div style="background: #f7fafc; padding: 20px 40px; text-align: center;
                border-top: 1px solid #e2e8f0;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Admin Portal. All rights reserved.
      </p>
    </div>
  </div>
`;

/**
 * Send OTP to ANY email address
 */
const sendOtpEmail = async (email, otp, name = "User") => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[EmailService] ❌ GMAIL_USER or GMAIL_APP_PASSWORD missing in .env file");
    return false;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Admin Portal" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔐 Your OTP Code - Expires in 5 Minutes",
    html: otpEmailTemplate(otp, name),
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
  };

  try {
    await transporter.verify();
    console.log("[EmailService] ✅ SMTP connection verified");

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ OTP sent to ${email} | ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EmailService] ❌ Send failed:");
    console.error("  Code   :", error.code);
    console.error("  Message:", error.message);
    console.error("  Response:", error.response);
    return false;
  }
};

module.exports = { sendOtpEmail };