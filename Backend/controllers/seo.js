const express = require("express");
const router = express.Router();
const Seo = require("../models/seo");

// CREATE
exports.CreateSeo=async (req, res) => {
    try {
        const newSeo = new Seo(req.body);
        const savedSeo = await newSeo.save();
        res.status(201).json(savedSeo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// READ ALL
exports.GetSeo= async (req, res) => {
    try {
        const allSeo = await Seo.find();
        res.json(allSeo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// READ BY ID
exports.GetSeoById=async (req, res) => {
    try {
        const seo = await Seo.findById(req.body._id);
        if (!seo) return res.status(404).json({ message: "SEO not found" });
        res.json(seo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// UPDATE
exports.UpdateSeo=async (req, res) => {
    try {
        const updatedSeo = await Seo.findByIdAndUpdate(req.body._id, req.body, { new: true });
        if (!updatedSeo) return res.status(404).json({ message: "SEO not found" });
        res.json(updatedSeo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// DELETE
exports.DeleteSeo=async (req, res) => {
    try {
        const deletedSeo = await Seo.findByIdAndDelete(req.body._id);
        if (!deletedSeo) return res.status(404).json({ message: "SEO not found" });
        res.json({ message: "SEO deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

