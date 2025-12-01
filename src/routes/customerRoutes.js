const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/customerController');

router.post('/',
  body('customerName').notEmpty().withMessage('CustomerName required'),
  body('contacts').isArray({ min: 1 }).withMessage('At least one contact required'),
  ctrl.createCustomer
);

router.get('/', ctrl.listCustomers);
router.get('/:id', ctrl.getCustomer);
router.put('/:id',
  param('id').isMongoId(),
  body('customerName').notEmpty(),
  body('contacts').isArray({ min: 1 }),
  ctrl.updateCustomer
);
router.patch('/:id/status',
  param('id').isMongoId(),
  body('status').isIn(['Active','Inactive']),
  ctrl.changeStatus
);

module.exports = router;
