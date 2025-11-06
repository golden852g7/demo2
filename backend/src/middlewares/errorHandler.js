const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details || undefined
    });
  }

  console.error(err);
  return res.status(500).json({ message: '服务器内部错误' });
};

module.exports = errorHandler;
