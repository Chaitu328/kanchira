const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    bannerImage: [
        {
            image: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model("banner", bannerSchema);
