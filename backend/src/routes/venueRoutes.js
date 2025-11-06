const express = require('express');
const { body } = require('express-validator');
const venueController = require('../controllers/venueController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', venueController.listVenues);
router.get('/:id', venueController.getVenue);
router.get('/:id/availability', venueController.checkAvailability);
router.get('/:id/usage', authenticate, authorize('admin'), venueController.getVenueUsage);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('名称不能为空'),
    body('location').notEmpty().withMessage('地址不能为空'),
    body('capacity').isInt({ min: 1 }).withMessage('容量需为正整数'),
    body('pricePerHour').isFloat({ min: 0 }).withMessage('价格需为正数')
  ],
  venueController.createVenue
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    body('name').optional().notEmpty(),
    body('location').optional().notEmpty(),
    body('capacity').optional().isInt({ min: 1 }),
    body('pricePerHour').optional().isFloat({ min: 0 })
  ],
  venueController.updateVenue
);

router.delete('/:id', authenticate, authorize('admin'), venueController.deleteVenue);

module.exports = router;
