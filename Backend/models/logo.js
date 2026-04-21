const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
    logo: {
        type: String
    },
    brandName: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: Number
    },
    address: {
        type: String
    }
});

module.exports = mongoose.model("logo", logoSchema);
