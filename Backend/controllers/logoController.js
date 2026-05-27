const Logo = require("../models/logo");

// Create Logo
exports.CreateLogo = async (req, res) => {
  try {
    const { logo, brandName, email, phoneNumber, address } = req.body;
    const newLogo = new Logo({ logo, brandName, email, phoneNumber, address });
    await newLogo.save();
    res.status(201).json({
      responseCode: 201,
      message: "Logo created successfully",
      data: newLogo,
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Logos
exports.GetLogo = async (req, res) => {
  try {
    const logos = await Logo.find();
    res.status(200).json({
      responseCode: 200,
      message: "Logos fetched successfully",
      data: logos,
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Logo by ID
exports.UpdateLogo = async (req, res) => {
  try {
    const { id, logo, brandName, phoneNumber, email, address } = req.body;
    const updatedLogo = await Logo.findByIdAndUpdate(
      id,
      { logo, brandName, phoneNumber, email, address },
      { new: true },
    );
    if (!updatedLogo) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "Logo not found" });
    }
    res.status(200).json({
      responseCode: 200,
      message: "Logo updated successfully",
      data: updatedLogo,
    });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete Logo by ID
exports.DeleteLogo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ responseCode: 400, message: "Logo ID is required" });
    }
    const deleted = await Logo.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "Logo not found" });
    }
    res
      .status(200)
      .json({ responseCode: 200, message: "Logo deleted successfully" });
  } catch (error) {
    res.status(500).json({
      responseCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};