const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const { User } = require('../database/models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, '未授权访问');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.sub);

    if (!user) {
      throw new ApiError(401, '用户不存在或已被删除');
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, '登录已过期或无效令牌'));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, '未授权访问'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, '无权访问此资源'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};
