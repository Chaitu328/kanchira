const twilio = require("twilio");
const axios = require("axios");
const User = require("../models/user");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const sendOtp2 = async (phone, userName, otp) => {
  try {
    await twilioClient.messages.create({
      body: `${userName} your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });
    console.log(
      `Dear ${userName}, your Sita Matka verification OTP is ${otp}. Please do not share this code with anyone. Thank you!`,
    );
    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    return false;
  }
};

const sendOtpForget = async (phone, otp) => {
  const url = `http://dltsms.jupitersms.com/http-tokenkeyapi.php?authentic-key=${process.env.JUPITER_SMS_AUTH_KEY}&senderid=${process.env.JUPITER_SMS_SENDER_ID}&route=1&number=${phone}&message=Dear%20Customer,%20Your%20OTP%20for%20verification%20is%20${otp}.%20Please%20enter%20this%20code%20to%20complete%20the%20process.%20TEXT2&templateid=${process.env.JUPITER_SMS_TEMPLATE_ID}`;

  try {
    const response = await axios.get(url);
    console.log("SMS Response:", response.data);
    return otp;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return false;
  }
};

const sendOtpSessation = async (phone, otp) => {
  const url = `http://dltsms.jupitersms.com/http-tokenkeyapi.php?authentic-key=${process.env.JUPITER_SMS_AUTH_KEY}&senderid=${process.env.JUPITER_SMS_SENDER_ID}&route=1&number=${phone}&message=Dear%20Customer,%20Your%20OTP%20for%20verification%20is%20${otp}.%20Please%20enter%20this%20code%20to%20complete%20the%20process.%20TEXT2&templateid=${process.env.JUPITER_SMS_TEMPLATE_ID}`;

  try {
    const response = await axios.get(url);
    console.log("SMS Response:", response.data);
    return otp;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return false;
  }
};

const sendOtp = async (phone, otp) => {
  console.log(phone, otp);
  const url = `http://dltsms.jupitersms.com/http-tokenkeyapi.php?authentic-key=${process.env.JUPITER_SMS_AUTH_KEY}&senderid=${process.env.JUPITER_SMS_SENDER_ID}&route=1&number=${phone}&message=Dear%20Customer,%20Your%20OTP%20for%20verification%20is%20${otp}.%20Please%20enter%20this%20code%20to%20complete%20the%20process.%20TEXT2&templateid=${process.env.JUPITER_SMS_TEMPLATE_ID}`;

  try {
    const response = await axios.get(url);
    console.log("SMS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return false;
  }
};

module.exports = { sendOtp, sendOtpForget };
