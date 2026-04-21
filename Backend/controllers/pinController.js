const mongoose = require("mongoose");
const PINcode = require("../models/pincode");

exports.createPinCode = async (req, res) => {
  try {
    const { pincode, available } = req.body;
    if (!pincode || typeof available !== "boolean") {
      return res
        .status(400)
        .json({ message: "Pincode and availability status are required" });
    }
    const existingPinCode = await PINcode.findOne({ pincode });
    if (existingPinCode) {
      return res.status(409).json({ message: "Pincode already exists" });
    }
    const newPinCode = new PINcode({ pincode, available });
    const savedPinCode = await newPinCode.save();
    res
      .status(201)
      .json({ message: "Pincode created successfully", data: savedPinCode });
  } catch (error) {
    console.error("Error creating pincode:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPincode = async (req, res) => {
  try {
    const pincodes = await PINcode.find();
    if (!pincodes) {
      return res.status(404).json({ message: "No pin codes available" });
    }
    res
      .status(200)
      .json({ message: "pin codes fetched successfully", pincodes });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.updatePinCode = async (req, res) => {
  try {
    const { pincode, available } = req.body;
    if (typeof available !== "boolean") {
      return res
        .status(400)
        .json({
          message: "Availability status is required and must be a boolean",
        });
    }
    const updatedPinCode = await PINcode.findOneAndUpdate(
      { pincode },
      { available },
      { new: true },
    );
    if (!updatedPinCode) {
      return res.status(404).json({ message: "Pincode not found" });
    }
    res
      .status(200)
      .json({ message: "Pincode updated successfully", data: updatedPinCode });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deletePinCode = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Pincode ID is required" });
    }
    const deleted = await PINcode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Pincode not found" });
    }
    res.status(200).json({ message: "Pincode deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
