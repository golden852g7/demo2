const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBooking);

router.post(
  '/',
  [
    body('venueId').notEmpty().withMessage('场地不能为空'),
    body('startTime').isISO8601().withMessage('开始时间格式错误'),
    body('endTime').isISO8601().withMessage('结束时间格式错误')
  ],
  bookingController.createBooking
);

router.post('/:id/pay', bookingController.payBooking);
router.post('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/complete', authorize('admin'), bookingController.completeBooking);

module.exports = router;
