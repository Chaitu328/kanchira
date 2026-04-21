const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async (email, subject, otp) => {
  const mailOptions = {
    from: "Mail From ACFI",
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #002b6a;">Your OTP Code</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #28a745; text-align: center; font-size: 32px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
        <br>
        <p>Best Regards,<br>Your Service Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (email, userName) => {
  const mailOptions = {
    from: "BRMhana Vantillu Food App",
    to: email,
    subject: "Welcome to Bramhana Vantillu - Delicious Food Awaits!",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://res.cloudinary.com/dtbonnhjg/image/upload/v1743657729/uploads/ketgr4xihbja4qyvv0aa.jpg" alt="Bramhana Vantillu Vantillu Logo" style="max-width: 200px;">
            </div>
            
            <h2 style="color: #002b6a;">Welcome, ${userName}!</h2>
            
            <p>Thank you for registering with Bramhana Vantillu Vantillu Food App. We're excited to have you on board!</p>
            
            <p>Now you can:</p>
            <ul>
                <li>Order delicious food from your favorite restaurants</li>
                <li>Track your orders in real-time</li>
                <li>Enjoy exclusive member discounts</li>
                <li>Save your favorite meals for quick reordering</li>
            </ul>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="font-weight: bold;">Get started now by placing your first order!</p>
                <a href="https://app.brmhanavantillu.com/order" style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Order Food</a>
            </div>
            
            <p>If you have any questions, please check our <a href="https://app.brmhanavantillu.com/help" style="color: #002b6a;">Help Center</a> or contact our <a href="mailto:support@brmhanavantillu.com" style="color: #002b6a;">Support Team</a>.</p>
            
            <p>Please review our:</p>
            <ul>
                <li><a href="https://app.brmhanavantillu.com/terms" style="color: #002b6a;">Terms of Service</a></li>
                <li><a href="https://app.brmhanavantillu.com/privacy" style="color: #002b6a;">Privacy Policy</a></li>
                <li><a href="https://app.brmhanavantillu.com/refund" style="color: #002b6a;">Refund Policy</a></li>
            </ul>
            
            <p>Happy eating!</p>
            
            <p>Best regards,<br>
            The BRMhana Vantillu Team</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                <p>© ${new Date().getFullYear()} BRMhana Vantillu. All rights reserved.</p>
                <p>
                    <a href="https://app.brmhanavantillu.com/unsubscribe" style="color: #666;">Unsubscribe</a> | 
                    <a href="https://app.brmhanavantillu.com/preferences" style="color: #666;">Email Preferences</a>
                </p>
            </div>
        </div>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Kanchira" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Kanchira Registration",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #800000; text-align: center;">Kanchira</h2>
            <p>Hello,</p>
            <p>Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #800000;">${otp}</span>
            </div>
            <p style="color: #888; font-size: 13px;">Do not share this OTP with anyone. If you did not request this, please ignore this email.</p>
            <br>
            <p>Best Regards,<br><strong>Kanchira Team</strong></p>
        </div>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = { sendEmail, sendWelcomeEmail };
