const FestivalDiscount = require('../models/festivalDiscount');

// Create new festival discount
exports.createFestivalDiscount = async (req, res) => {
    try {
        const discount = new FestivalDiscount(req.body);
        const savedDiscount = await discount.save();
        res.status(201).json(savedDiscount);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

// Update existing festival discount by ID
exports.updateFestivalDiscount = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedDiscount = await FestivalDiscount.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedDiscount) {
            return res.status(404).json({ error: 'Discount not found' });
        }
        res.json(updatedDiscount);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

// Get all festival discounts
exports.getAllFestivalDiscounts = async (req, res) => {
    try {
        const discounts = await FestivalDiscount.find().sort({ startDate: -1 });
        res.json(discounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get a festival discount by ID
exports.getFestivalDiscountById = async (req, res) => {
    const { id } = req.params;
    try {
        const discount = await FestivalDiscount.findById(id);
        if (!discount) {
            return res.status(404).json({ error: 'Discount not found' });
        }
        res.json(discount);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
