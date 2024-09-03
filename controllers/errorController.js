const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}, please try again!`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `INVALID INPUT DATA: ${errors.join('. ')} `;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) => {
  return new AppError('Invalid Token. Please login again!', 401);
};

const handleTokenExpiredError = (err) => {
  return new AppError('Your token is expired! Please login again.', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted errors:
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknow error:
    console.error('🚀🚀🚀ERROR=', err);

    res.status(500).json({
      staus: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error);

    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    // find result and send to the client
    sendErrorProd(error, res);
  }
};
