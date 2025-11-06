const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少 6 位')
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  authController.login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('邮箱格式不正确')],
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('重置令牌不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少 6 位')
  ],
  authController.resetPassword
);

module.exports = router;
