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

const VendorSchema = new mongoose.Schema({
  vendorCode: { type: String, required: true, unique: true },
  vendorName: { type: String, required: true },
  shortName: { type: String },
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

VendorSchema.index({ vendorName: 'text', vendorCode: 'text', city: 1 });

module.exports = mongoose.model('Vendor', VendorSchema);
