const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
  console.log('🚀🚀🚀  err.name=', err.name);
  console.log('🚀🚀🚀  err.message=', err.message);
  console.log('🚀🚀🚀 UNHANDLED REJECTIONS => Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
