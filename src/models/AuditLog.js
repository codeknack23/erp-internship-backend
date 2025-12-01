const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  module: { type: String, required: true },
  recordId: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
