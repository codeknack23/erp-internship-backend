const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  originalName: String,
  url: String,
  publicId: String
});

const ContactSchema = new mongoose.Schema({
  name: String,
  designation: String,
  phone: String,
  email: String,
  isPrimary: { type: Boolean, default: false },
  level: {
    type: String,
    enum: ["project", "branch", "department"],
    default: "project"
  }
});

const ProjectSchema = new mongoose.Schema({
  projectCode: String,
  projectName: { type: String, required: true },

  company: { type: String, required: true },
  branch: { type: String, required: true },
  department: { type: String, required: true },

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

  projectPlace: String,
  startDate: Date,
  endDate: Date,
  estimatedBudget: Number,

  status: {
    type: String,
    enum: ["Not Started", "Ongoing", "On Hold", "Completed", "Cancelled"],
    default: "Not Started"
  },

  contacts: [ContactSchema],
  attachments: [AttachmentSchema],

  createdAt: { type: Date, default: Date.now },
  modifiedAt: Date
});

module.exports = mongoose.model("Project", ProjectSchema);
