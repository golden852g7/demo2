const { app, initializeDatabase } = require('./app');
const config = require('./config');

const startServer = async () => {
  await initializeDatabase();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer();
