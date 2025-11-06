'use strict';

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: {
      type: DataTypes.ENUM('alipay'),
      defaultValue: 'alipay'
    },
    transactionNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('initiated', 'successful', 'failed', 'refunded'),
      defaultValue: 'initiated'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {});

  Payment.associate = function(models) {
    Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
  };

  return Payment;
};
