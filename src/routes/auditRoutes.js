const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");

router.get("/", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })  // IMPORTANT
      .limit(5);

    res.json(logs);
  } catch (err) {
    console.error("Audit fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
