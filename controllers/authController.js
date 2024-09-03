const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// todo SIGNTOKEN
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// todo SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

// todo LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 If email & password exist
  if (!email || !password) {
    return next(new AppError('Please provide email & password!', 400));
  }

  // 2 Check if user exist && password is correct
  const user = await User.findOne({ email: email }).select('+password');
  const correct = user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3 If everything is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

// todo PROTECT
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('🚀🚀🚀  token=', token);
  if (!token) {
    return next(
      new AppError('You are not login! Please login to get access.', 401)
    );
  }

  // 2. Vertify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const curUser = await User.findById(decoded.id);
  if (!curUser) {
    return next(
      new AppError('The user belong to this token does no longer exist!', 401)
    );
  }

  // 4. Check if user changed password after the token was issued
  if (curUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User currently changed password. Please login again to get access!'
      )
    );
  }

  // GRANT ACCESS
  req.user = curUser;
  next();
});

// todo restrictTo
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin" ,"lead-guide"]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// todo forgotPassword
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 - Get user base on POSTed Email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with email address!', 404));

  // 2 - Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 - Send it to user's email
  next();
});

exports.resetPassword = (req, res, next) => {};
