const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const ApiError = require('../utils/apiError');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }

    const { email } = req.body;
    const result = await authService.initiatePasswordReset(email);
    res.json({
      message: '重置链接已发送，请查看邮箱（或使用返回的令牌完成重置）',
      resetToken: result.resetToken,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, '参数验证失败', errors.array());
    }
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
