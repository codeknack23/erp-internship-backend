// src/routes/metaRoutes.js
const express = require("express");
const router = express.Router();
const MetaData = require("../models/MetaData");

// companies
router.get("/companies", async (req, res) => {
  const items = await MetaData.find({ type: "company" }).sort({ name: 1 });
  res.json(items);
});

// branches by company name
router.get("/branches/:companyName", async (req, res) => {
  const items = await MetaData.find({ type: "branch", parent: req.params.companyName }).sort({ name: 1 });
  res.json(items);
});

// departments by branch name
router.get("/departments/:branchName", async (req, res) => {
  const items = await MetaData.find({ type: "department", parent: req.params.branchName }).sort({ name: 1 });
  res.json(items);
});

module.exports = router;
