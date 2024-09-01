const mongoose = require('mongoose');
const dotenv = require('dotenv');

// todo Catching ncaught Exceptions
process.on('uncaughtException', err => {
  console.log('🚀🚀🚀Uncaught Exceptions => Shutting down...');
  console.log('🚀🚀🚀err =', err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('🚀DB connection successful!');
    console.log('🚀ENV = ', process.env.NODE_ENV);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🚀App running on port ${port}...`);
});

// todo Handle Errors Outside Express Unhandled Rejections
process.on('unhandledRejection', err => {
  console.log('🚀🚀🚀Unhandled Rejections => Shutting down...');
  console.log('🚀🚀🚀err =', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
