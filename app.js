const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) GLOBAL MIDDLEWARES
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 1000,
  message: 'Too many requests from this IP, please try again in 1 hour!',
  statusCode: 429
});

app.use('/api', limiter);

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

//  Data Sanitization agaist NoSQL query injection
app.use(mongoSanitize());

//  Data Sanitization agaist  XSS
app.use(xss());

// Preventing Parameter Pollution
app.use(hpp());

// Static File
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// todo GLOBAL EROR HANDLE MIDDWARE
app.use(globalErrorHandler);

module.exports = app;
