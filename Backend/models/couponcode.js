const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:       { type: String, required: true, unique: true },
    type:       { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    value:      { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    active:     { type: Boolean, default: true },
    // Which admin created this coupon
    adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
