const mongoose = require("mongoose");

const swiperSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

const Swiper = mongoose.models.Swiper || mongoose.model("Swiper", swiperSchema);

exports.getSwipers = async (req, res) => {
  try {
    const swipers = await Swiper.find().sort({ createdAt: -1 });
    res.status(200).json({ responseCode: 200, swipers });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createSwiper = async (req, res) => {
  try {
    const { image, title, description } = req.body;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }
    const swiper = new Swiper({ image, title, description });
    await swiper.save();
    res.status(201).json({ message: "Swiper created successfully", swiper });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteSwiper = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Swiper ID is required" });
    }
    const deleted = await Swiper.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ message: "Swiper not found" });
    }
    res.status(200).json({ message: "Swiper deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
