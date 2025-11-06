const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { User } = require('../database/models');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt');
const config = require('../config');

const register = async ({ name, email, phone, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(400, '邮箱已被注册');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone: phone || null, passwordHash, role: 'user' });

  const token = signToken({ sub: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, '邮箱或密码错误');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, '邮箱或密码错误');
  }

  const token = signToken({ sub: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const initiatePasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, '用户不存在');
  }

  const token = uuidv4();
  user.resetToken = token;
  user.resetTokenExpiresAt = dayjs().add(config.resetTokenExpiresMinutes, 'minute').toDate();
  await user.save();

  return {
    resetToken: token,
    expiresAt: user.resetTokenExpiresAt
  };
};

const resetPassword = async ({ token, newPassword }) => {
  const user = await User.findOne({ where: { resetToken: token } });
  if (!user) {
    throw new ApiError(400, '重置链接无效');
  }

  if (!user.resetTokenExpiresAt || dayjs().isAfter(user.resetTokenExpiresAt)) {
    throw new ApiError(400, '重置链接已过期');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  return { message: '密码重置成功' };
};

module.exports = {
  register,
  login,
  initiatePasswordReset,
  resetPassword
};
