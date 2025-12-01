const Vendor = require('../models/Vendor');
const AuditLog = require('../models/AuditLog');
const generateCode = require('../utils/generateCode');
const { isValidGST } = require('../utils/validators');

const createVendor = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.vendorName) return res.status(400).json({ message: 'vendorName required' });
    if (!payload.contacts || !Array.isArray(payload.contacts) || payload.contacts.length === 0) return res.status(400).json({ message: 'At least one contact is required' });
    if (payload.gstin && !isValidGST(payload.gstin)) return res.status(400).json({ message: 'Invalid GSTIN format' });

    const existing = await Vendor.findOne({ vendorName: { $regex: `^${payload.vendorName}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Vendor already exists' });

    const count = await Vendor.countDocuments();
    const vendorCode = generateCode('VEND', count + 1);

    if (!payload.contacts.some(c => c.isPrimary)) payload.contacts[0].isPrimary = true;

    const vendor = new Vendor({ ...payload, vendorCode });
    await vendor.save();

    await AuditLog.create({ module: 'Vendor', recordId: vendor._id.toString(), action: 'CREATE' });

    res.status(201).json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Vendor.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Not found' });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVendor = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Vendor.findById(id);
    if (!existing) return res.status(404).json({ message: 'Vendor not found' });

    if (req.body.vendorCode && req.body.vendorCode !== existing.vendorCode) {
      return res.status(400).json({ message: 'VendorCode cannot be changed' });
    }

    if (!req.body.contacts || req.body.contacts.length === 0) return res.status(400).json({ message: 'At least one contact required' });

    if (req.body.gstin && !isValidGST(req.body.gstin)) return res.status(400).json({ message: 'Invalid GSTIN format' });

    if (req.body.contacts.filter(c => c.isPrimary).length === 0) req.body.contacts[0].isPrimary = true;
    if (req.body.contacts.filter(c => c.isPrimary).length > 1) {
      let keep = false;
      req.body.contacts = req.body.contacts.map(c => {
        if (c.isPrimary && !keep) { keep = true; return c; }
        return { ...c, isPrimary: false };
      });
    }

    const updated = await Vendor.findByIdAndUpdate(id, { ...req.body, modifiedAt: new Date(), modifiedBy: req.body.modifiedBy || 'system' }, { new: true });

    await AuditLog.create({ module: 'Vendor', recordId: id, action: 'UPDATE' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changeVendorStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: 'Not found' });

    vendor.status = status;
    vendor.modifiedAt = new Date();
    await vendor.save();

    await AuditLog.create({ module: 'Vendor', recordId: id, action: 'STATUS_CHANGE' });

    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createVendor, listVendors, getVendor, updateVendor, changeVendorStatus };
