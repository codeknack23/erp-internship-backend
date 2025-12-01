const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String },
  email: { type: String },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  status: { type: String, enum: ['Active','Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

const CustomerSchema = new mongoose.Schema({
  customerCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  shortName: { type: String },
  customerType: { type: String, enum: ['Regular','GST','Unregistered'], default: 'Regular' },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  country: { type: String, default: 'India' },
  email: { type: String },
  phone: { type: String },
  gstin: { type: String },
  pan: { type: String },
  msme: { type: Boolean, default: false },
  status: { type: String, enum: ['Active','Inactive'], default: 'Active' },
  contacts: [ContactSchema],
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  modifiedBy: { type: String },
  modifiedAt: { type: Date, default: Date.now }
});

CustomerSchema.index({ customerName: 'text', customerCode: 'text', city: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
