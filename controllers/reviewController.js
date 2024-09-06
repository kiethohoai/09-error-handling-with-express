const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

// todo getAllReviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  // Query to DB, get all reviews belong this tourId
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// todo createReview
exports.createReview = catchAsync(async (req, res, next) => {
  // INPUT: userId = req.user.id (protect), tourId = req.params.tourId (params)
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// todo deleteReview
exports.deleteReview = factory.deleteOne(Review);
