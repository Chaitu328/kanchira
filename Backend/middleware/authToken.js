const querystring = require('querystring');
const axios = require('axios');

const CLIENT_VERSION = "1";
const GRANT_TYPE = "client_credentials";

const generateAuthToken = async () => {
    try {
        const tokenRequest = {
            client_id: process.env.PHONEPE_SANDBOX_CLIENT_ID,
            client_version: CLIENT_VERSION,
            client_secret: process.env.PHONEPE_SANDBOX_CLIENT_SECRET,
            grant_type: GRANT_TYPE,
        };

        const tokenOptions = {
            method: 'post',
            url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: querystring.stringify(tokenRequest),
        };

        const response = await axios(tokenOptions);
        return response.data.access_token;
    } catch (error) {
        console.error('Token generation error:', error.response?.data || error.message);
        return null;
    }
};

module.exports = { generateAuthToken };
