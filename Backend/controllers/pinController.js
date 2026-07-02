const mongoose = require("mongoose");
const XLSX = require("xlsx");
const PINcode = require("../models/pincode");

// 6-digit Indian pincode format
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

exports.createPinCode = async (req, res) => {
  try {
    const { pincode, available, areaName } = req.body;
    if (!pincode || typeof available !== "boolean") {
      return res
        .status(400)
        .json({ message: "Pincode and availability status are required" });
    }
    const existingPinCode = await PINcode.findOne({ pincode });
    if (existingPinCode) {
      return res.status(409).json({ message: "Pincode already exists" });
    }
    const newPinCode = new PINcode({ pincode, available, areaName: areaName || "" });
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
    const { pincode, available, areaName } = req.body;
    if (typeof available !== "boolean") {
      return res
        .status(400)
        .json({
          message: "Availability status is required and must be a boolean",
        });
    }
    const updatedPinCode = await PINcode.findOneAndUpdate(
      { pincode },
      { available, areaName },
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
    const { id } = req.params;
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

// ── Search pincodes (by partial match) ──────────────────────────
exports.searchPinCode = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { pincode: { $regex: String(q).trim(), $options: "i" } } : {};
    const pincodes = await PINcode.find(filter).sort({ pincode: 1 });
    res.status(200).json({ message: "Pincodes fetched successfully", pincodes });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── Bulk upload pincodes via Excel (.xlsx / .xls) ───────────────
exports.bulkUploadPinCodes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch (e) {
      return res.status(400).json({ message: "Invalid or corrupted Excel file" });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ message: "Excel file has no sheets" });
    }
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const totalRecords = rows.length;
    const failedRecords = [];
    const duplicateRecords = [];
    const validEntries = []; // { pincode, available }
    const seenInFile = new Set();

    if (totalRecords === 0) {
      return res.status(400).json({
        message: "The uploaded file has no data rows",
        summary: { total: 0, success: 0, failed: 0, duplicate: 0 },
      });
    }

    // Existing pincodes in DB, for duplicate detection
    const existingDocs = await PINcode.find({}, { pincode: 1 }).lean();
    const existingSet = new Set(existingDocs.map((d) => String(d.pincode)));

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      // Accept common header variants
      const rawValue =
        row.Pincode ?? row.pincode ?? row.PINCODE ?? row.PinCode ?? row["Pin Code"] ?? "";
      const rawAvailable =
        row.Available ?? row.available ?? row.AVAILABLE ?? row.Status ?? row.status;

      const trimmed = String(rawValue).trim();

      // Empty row check
      if (trimmed === "") {
        failedRecords.push({ row: rowNum, value: rawValue, reason: "Empty pincode" });
        return;
      }

      // Format validation — must be a 6-digit number, not starting with 0
      if (!PINCODE_REGEX.test(trimmed)) {
        failedRecords.push({ row: rowNum, value: rawValue, reason: "Invalid pincode format" });
        return;
      }

      // Duplicate within the file itself
      if (seenInFile.has(trimmed)) {
        duplicateRecords.push({ row: rowNum, value: trimmed, reason: "Duplicate within file" });
        return;
      }

      // Duplicate against existing DB records
      if (existingSet.has(trimmed)) {
        duplicateRecords.push({ row: rowNum, value: trimmed, reason: "Already exists in database" });
        return;
      }

      seenInFile.add(trimmed);

      let available = true;
      if (typeof rawAvailable === "boolean") {
        available = rawAvailable;
      } else if (rawAvailable !== undefined && rawAvailable !== "") {
        const normalized = String(rawAvailable).trim().toLowerCase();
        available = !["no", "false", "0", "unavailable", "n"].includes(normalized);
      }

      const rawAreaName =
        row["Area Name"] ?? row.areaName ?? row.AreaName ?? row.Area ?? row.area ?? "";

      validEntries.push({ pincode: Number(trimmed), available, areaName: String(rawAreaName).trim() });
    });

    let inserted = [];
    if (validEntries.length > 0) {
      try {
        inserted = await PINcode.insertMany(validEntries, { ordered: false });
      } catch (bulkErr) {
        // insertMany with ordered:false still inserts the valid docs and
        // collects errors for ones that failed (e.g. race-condition duplicates)
        if (bulkErr.insertedDocs) inserted = bulkErr.insertedDocs;
        else if (bulkErr.result && bulkErr.result.insertedIds) {
          inserted = Object.values(bulkErr.result.insertedIds);
        }
      }
    }

    return res.status(200).json({
      message: "Bulk upload processed",
      summary: {
        total: totalRecords,
        success: inserted.length,
        failed: failedRecords.length,
        duplicate: duplicateRecords.length,
      },
      failedRecords,
      duplicateRecords,
    });
  } catch (error) {
    console.error("Error in bulk pincode upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── Export all pincodes as an Excel file ────────────────────────
exports.exportPinCodes = async (req, res) => {
  try {
    const pincodes = await PINcode.find().sort({ pincode: 1 }).lean();
    const rows = pincodes.map((p) => ({
      Pincode: p.pincode,
      "Area Name": p.areaName || "",
      Available: p.available ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pincodes");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=pincodes-export.xlsx");
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting pincodes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── Downloadable sample Excel template ──────────────────────────
exports.downloadSamplePinCodeFile = async (req, res) => {
  try {
    const sampleRows = [
      { Pincode: 500072, "Area Name": "Kukatpally", Available: "Yes" },
      { Pincode: 500085, "Area Name": "KPHB Colony", Available: "Yes" },
      { Pincode: 500090, "Area Name": "Nizampet", Available: "Yes" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=pincode-sample-template.xlsx");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};