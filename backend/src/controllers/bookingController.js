const { validationResult } = require('express-validator');
const bookingService = require('../services/bookingService');
const ApiError = require('../utils/apiError');

const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }

    const booking = await bookingService.createBooking({
      userId: req.user.id,
      venueId: req.body.venueId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      notes: req.body.notes
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const listBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.listBookings({ requester: req.user });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingDetail(req.params.id, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.completeBooking(req.params.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

const payBooking = async (req, res, next) => {
  try {
    const result = await bookingService.payBooking(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  payBooking
};
