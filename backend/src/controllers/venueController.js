const { validationResult } = require('express-validator');
const venueService = require('../services/venueService');
const bookingService = require('../services/bookingService');
const ApiError = require('../utils/apiError');

const listVenues = async (req, res, next) => {
  try {
    const venues = await venueService.listVenues();
    res.json(venues);
  } catch (error) {
    next(error);
  }
};

const getVenue = async (req, res, next) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    res.json(venue);
  } catch (error) {
    next(error);
  }
};

const createVenue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }
    const venue = await venueService.createVenue(req.body);
    res.status(201).json(venue);
  } catch (error) {
    next(error);
  }
};

const updateVenue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }
    const venue = await venueService.updateVenue(req.params.id, req.body);
    res.json(venue);
  } catch (error) {
    next(error);
  }
};

const deleteVenue = async (req, res, next) => {
  try {
    const response = await venueService.deleteVenue(req.params.id);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      throw new ApiError(400, '缺少开始或结束时间');
    }
    const result = await venueService.getVenueAvailability(req.params.id, startTime, endTime);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getVenueUsage = async (req, res, next) => {
  try {
    const bookings = await bookingService.getVenueUsage(req.params.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  checkAvailability,
  getVenueUsage
};
