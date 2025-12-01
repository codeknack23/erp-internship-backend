const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const generateCode = require('../utils/generateCode');

const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { customerName, contacts } = req.body;
    if (!customerName) return res.status(400).json({ message: 'customerName required' });
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) return res.status(400).json({ message: 'At least one contact required' });

    const existing = await Customer.findOne({ customerName: { $regex: `^${customerName}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Customer already exists' });

    const count = await Customer.countDocuments();
    const customerCode = generateCode('CUST', count + 1);

    if (!contacts.some(c => c.isPrimary)) contacts[0].isPrimary = true;

    const customer = new Customer({ ...req.body, customerCode });
    await customer.save();

    await AuditLog.create({ module: 'Customer', recordId: customer._id.toString(), action: 'CREATE' });

    return res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (q) filter.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Customer.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Not found' });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Customer.findById(id);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    if (req.body.customerCode && req.body.customerCode !== existing.customerCode) {
      return res.status(400).json({ message: 'CustomerCode cannot be changed' });
    }

    if (!req.body.contacts || req.body.contacts.length === 0) {
      return res.status(400).json({ message: 'At least one contact is required' });
    }

    if (req.body.contacts.filter(c => c.isPrimary).length === 0) req.body.contacts[0].isPrimary = true;
    if (req.body.contacts.filter(c => c.isPrimary).length > 1) {
      let keep = false;
      req.body.contacts = req.body.contacts.map(c => {
        if (c.isPrimary && !keep) { keep = true; return c; }
        return { ...c, isPrimary: false };
      });
    }

    const updated = await Customer.findByIdAndUpdate(id, { ...req.body, modifiedAt: new Date(), modifiedBy: req.body.modifiedBy || 'system' }, { new: true });

    await AuditLog.create({ module: 'Customer', recordId: id, action: 'UPDATE' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: 'Not found' });

    customer.status = status;
    customer.modifiedAt = new Date();
    await customer.save();

    await AuditLog.create({ module: 'Customer', recordId: id, action: 'STATUS_CHANGE' });

    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCustomer, listCustomers, getCustomer, updateCustomer, changeStatus };
