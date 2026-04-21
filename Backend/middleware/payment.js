// ✅ FIX: axios was missing — caused "axios is not defined" crash
const axios = require("axios");

exports.getPhonePeProdToken = async () => {
  const clientId = process.env.PHONEPE_PROD_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_PROD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Missing PhonePe env vars");
    return null;
  }

  const tokenUrl =
    "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

  // ✅ PhonePe requires credentials in the BODY, not Basic Auth header
  const body = new URLSearchParams();
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("client_version", "1");
  body.append("grant_type", "client_credentials");

  try {
    const response = await axios.post(tokenUrl, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("✅ PhonePe prod token OK");
    return response.data.access_token;
  } catch (error) {
    console.error(
      "❌ PhonePe token error:",
      error.response?.data || error.message,
    );
    return null; // don't throw — controller handles null → 400
  }
};
