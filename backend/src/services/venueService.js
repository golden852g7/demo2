const { Venue, Booking } = require('../database/models');
const ApiError = require('../utils/apiError');
const { Op } = require('sequelize');

const listVenues = async () => {
  return Venue.findAll({ order: [['createdAt', 'DESC']] });
};

const getVenueById = async (id) => {
  const venue = await Venue.findByPk(id);
  if (!venue) {
    throw new ApiError(404, '场地不存在');
  }
  return venue;
};

const createVenue = async (payload) => {
  return Venue.create(payload);
};

const updateVenue = async (id, payload) => {
  const venue = await getVenueById(id);
  return venue.update(payload);
};

const deleteVenue = async (id) => {
  const venue = await getVenueById(id);
  await venue.destroy();
  return { message: '删除成功' };
};

const checkAvailability = async (venueId, startTime, endTime) => {
  const overlapping = await Booking.findOne({
    where: {
      venueId,
      status: { [Op.notIn]: ['cancelled', 'completed'] },
      [Op.or]: [
        {
          startTime: {
            [Op.lt]: endTime
          },
          endTime: {
            [Op.gt]: startTime
          }
        }
      ]
    }
  });

  return !overlapping;
};

const getVenueAvailability = async (venueId, startTime, endTime) => {
  await getVenueById(venueId);
  const isAvailable = await checkAvailability(venueId, startTime, endTime);
  return {
    venueId,
    available: isAvailable,
    startTime,
    endTime
  };
};

module.exports = {
  listVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  checkAvailability,
  getVenueAvailability
};
