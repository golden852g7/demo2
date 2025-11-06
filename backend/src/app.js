const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/apiError');
const { sequelize } = require('./database/models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);
app.use('/api', (req, res, next) => next(new ApiError(404, '接口不存在')));

const frontendPath = path.resolve(__dirname, '../..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorHandler);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败', error);
  }
};

module.exports = { app, initializeDatabase };
