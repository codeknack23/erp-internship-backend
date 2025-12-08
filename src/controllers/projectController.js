const Project = require("../models/Project");
const AuditLog = require("../models/AuditLog");
const generateCode = require("../utils/generateCode");

// ✅ CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const data = req.body;

    if (!data.projectName)
      return res.status(400).json({ message: "Project name required" });

    if (!data.company || !data.branch || !data.department)
      return res.status(400).json({ message: "Company, Branch & Department required" });

    if (!data.contacts || !Array.isArray(data.contacts) || data.contacts.length === 0)
      return res.status(400).json({ message: "At least one contact required" });

    // ✅ FIX EMPTY IDS
    const payload = {
      ...data,
      customerId: data.customerId || null,
      vendorId: data.vendorId || null,
    };

    // ✅ ONLY ONE PRIMARY CONTACT
    if (payload.contacts.filter(c => c.isPrimary).length > 1) {
      let keep = false;
      payload.contacts = payload.contacts.map(c => {
        if (c.isPrimary && !keep) {
          keep = true;
          return c;
        }
        return { ...c, isPrimary: false };
      });
    }

    if (payload.contacts.filter(c => c.isPrimary).length === 0)
      payload.contacts[0].isPrimary = true;

    const count = await Project.countDocuments();
    payload.projectCode = generateCode("PROJ", count + 1);

    const project = await Project.create(payload);

    await AuditLog.create({
      module: "Project",
      recordId: project._id.toString(),
      action: "PROJECT_CREATE"
    });

    res.status(201).json(project);

  } catch (err) {
    console.error("PROJECT CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ LIST PROJECTS (PAGINATION)
exports.listProjects = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Project.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Project.countDocuments()
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });

  } catch (err) {
    console.error("PROJECT LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET SINGLE PROJECT
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error("PROJECT GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const data = req.body;

    data.customerId = data.customerId || null;
    data.vendorId = data.vendorId || null;

    if (data.contacts?.filter(c => c.isPrimary).length > 1) {
      let keep = false;
      data.contacts = data.contacts.map(c => {
        if (c.isPrimary && !keep) {
          keep = true;
          return c;
        }
        return { ...c, isPrimary: false };
      });
    }

    if (data.contacts?.filter(c => c.isPrimary).length === 0)
      data.contacts[0].isPrimary = true;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { ...data, modifiedAt: new Date() },
      { new: true }
    );

    await AuditLog.create({
      module: "Project",
      recordId: req.params.id,
      action: "PROJECT_UPDATE"
    });

    res.json(updated);

  } catch (err) {
    console.error("PROJECT UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ✅ ✅ DASHBOARD PROJECT STATS (MISSING EARLIER)
exports.projectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();

    const pending = await Project.countDocuments({
      status: { $in: ["Not Started", "Ongoing", "On Hold"] }
    });

    const completed = await Project.countDocuments({
      status: "Completed"
    });

    res.json({
      total,
      pending,
      completed
    });

  } catch (err) {
    console.error("PROJECT STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load project stats" });
  }
};
