const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { Booking, Venue, Payment, User } = require('../database/models');
const ApiError = require('../utils/apiError');
const { checkAvailability } = require('./venueService');

const HOURS_IN_MS = 60 * 60 * 1000;

const calculateAmount = (startTime, endTime, pricePerHour) => {
  const diffMs = dayjs(endTime).diff(dayjs(startTime));
  if (diffMs <= 0) {
    throw new ApiError(400, '结束时间必须大于开始时间');
  }
  const hours = diffMs / HOURS_IN_MS;
  return (hours * parseFloat(pricePerHour)).toFixed(2);
};

const createBooking = async ({ userId, venueId, startTime, endTime, notes }) => {
  const venue = await Venue.findByPk(venueId);
  if (!venue) {
    throw new ApiError(404, '场地不存在');
  }

  const available = await checkAvailability(venueId, startTime, endTime);
  if (!available) {
    throw new ApiError(400, '所选时间段已被预约');
  }

  const totalAmount = calculateAmount(startTime, endTime, venue.pricePerHour);

  const booking = await Booking.create({
    userId,
    venueId,
    startTime,
    endTime,
    totalAmount,
    notes,
    status: 'pending',
    paymentStatus: 'unpaid'
  });

  return booking;
};

const listBookings = async ({ requester }) => {
  if (requester.role === 'admin') {
    return Booking.findAll({
      include: [
        { model: Venue, as: 'venue' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  return Booking.findAll({
    where: { userId: requester.id },
    include: [{ model: Venue, as: 'venue' }],
    order: [['createdAt', 'DESC']]
  });
};

const getBookingDetail = async (id, requester) => {
  const booking = await Booking.findByPk(id, {
    include: [
      { model: Venue, as: 'venue' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Payment, as: 'payments' }
    ]
  });
  if (!booking) {
    throw new ApiError(404, '预约不存在');
  }

  if (requester.role !== 'admin' && booking.userId !== requester.id) {
    throw new ApiError(403, '无权查看该预约');
  }

  return booking;
};

const cancelBooking = async (id, requester) => {
  const booking = await Booking.findByPk(id);
  if (!booking) {
    throw new ApiError(404, '预约不存在');
  }

  if (requester.role !== 'admin' && booking.userId !== requester.id) {
    throw new ApiError(403, '无权取消该预约');
  }

  if (booking.status === 'completed') {
    throw new ApiError(400, '订单已完成无法取消');
  }

  booking.status = 'cancelled';
  booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : 'unpaid';
  await booking.save();

  await Payment.update({ status: 'refunded' }, { where: { bookingId: booking.id, status: 'successful' } });

  return booking;
};

const completeBooking = async (id) => {
  const booking = await Booking.findByPk(id);
  if (!booking) {
    throw new ApiError(404, '预约不存在');
  }

  if (booking.status !== 'confirmed') {
    throw new ApiError(400, '只有已支付的预约才能标记完成');
  }

  booking.status = 'completed';
  await booking.save();
  return booking;
};

const payBooking = async (id, requester) => {
  const booking = await Booking.findByPk(id, { include: [{ model: Payment, as: 'payments' }] });
  if (!booking) {
    throw new ApiError(404, '预约不存在');
  }

  if (requester.role !== 'admin' && booking.userId !== requester.id) {
    throw new ApiError(403, '无权支付该预约');
  }

  if (booking.paymentStatus === 'paid') {
    throw new ApiError(400, '订单已支付');
  }

  const payment = await Payment.create({
    bookingId: booking.id,
    provider: 'alipay',
    transactionNo: `ALIPAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount: booking.totalAmount,
    status: 'successful',
    paidAt: new Date()
  });

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  await booking.save();

  return { booking, payment };
};

const getVenueUsage = async (venueId) => {
  const bookings = await Booking.findAll({
    where: {
      venueId,
      status: { [Op.in]: ['pending', 'confirmed'] }
    },
    order: [['startTime', 'ASC']]
  });
  return bookings;
};

module.exports = {
  createBooking,
  listBookings,
  getBookingDetail,
  cancelBooking,
  completeBooking,
  payBooking,
  getVenueUsage
};
