// src/models/MetaData.js
const mongoose = require("mongoose");

const MetaDataSchema = new mongoose.Schema({
  type: { type: String, enum: ["company","branch","department"], required: true },
  name: { type: String, required: true },
  parent: { type: String, default: null } // parent name
});

module.exports = mongoose.model("MetaData", MetaDataSchema);
