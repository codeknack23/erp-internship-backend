const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/vendorController');

router.post('/',
  body('vendorName').notEmpty().withMessage('vendorName required'),
  body('contacts').isArray({ min: 1 }).withMessage('At least one contact required'),
  ctrl.createVendor
);

router.get('/', ctrl.listVendors);
router.get('/:id', ctrl.getVendor);
router.put('/:id',
  param('id').isMongoId(),
  body('vendorName').notEmpty(),
  body('contacts').isArray({ min: 1 }),
  ctrl.updateVendor
);
router.patch('/:id/status',
  param('id').isMongoId(),
  body('status').isIn(['Active','Inactive']),
  ctrl.changeVendorStatus
);

module.exports = router;
