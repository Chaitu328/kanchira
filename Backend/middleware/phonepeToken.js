const axios = require('axios');
const qs = require('qs');

const CLIENT_VERSION = "1";
const GRANT_TYPE = "client_credentials";

const generateAuthToken = async () => {
    try {
        const tokenRequest = {
            client_id: process.env.PHONEPE_SANDBOX2_CLIENT_ID,
            client_version: CLIENT_VERSION,
            client_secret: process.env.PHONEPE_SANDBOX2_CLIENT_SECRET,
            grant_type: GRANT_TYPE
        };

        const response = await axios.post(
            'https://api-preprod.phonepe.com/apis/identity-manager/v1/oauth/token',
            qs.stringify(tokenRequest),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("Token generation error:", error.response?.data || error.message);
        return false;
    }
};

module.exports = { generateAuthToken };
