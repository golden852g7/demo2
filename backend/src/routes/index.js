const express = require('express');
const authRoutes = require('./authRoutes');
const venueRoutes = require('./venueRoutes');
const bookingRoutes = require('./bookingRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/venues', venueRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
