const mongoose = require("mongoose");
const Enquery = require("../models/enqueryform");

exports.createEnquery = async (req, res) => {
    try {
        const { userId, fullName, email, phoneNumber, message } = req.body;

        if (!fullName || !email || !phoneNumber || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEnquery = new Enquery({
            fullName,
            email,
            phoneNumber,
            message,
        });

        const savedEnquery = await newEnquery.save();

        res.status(201).json({
            message: "Enquiry created successfully",
            data: savedEnquery,
        });
    } catch (error) {
        
        res.status(500).json({ message: "Internal Server Error" });
    }
};