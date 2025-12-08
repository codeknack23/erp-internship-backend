const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPDF = file.mimetype === "application/pdf";

    return {
      folder: "erp-projects",
      resource_type: isPDF ? "raw" : "image", // ✅ THIS IS THE REAL FIX
      public_id: `${Date.now()}-${file.originalname}`,
      format: isPDF ? "pdf" : undefined
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ✅ FINAL ROUTE
router.post("/projects", upload.array("files", 10), (req, res) => {
  try {
    const files = (req.files || []).map(file => ({
      originalName: file.originalname,
      url: file.path,
      publicId: file.filename
    }));

    res.json({ files });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
