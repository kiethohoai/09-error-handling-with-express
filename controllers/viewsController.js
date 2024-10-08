const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tours data from collection
  const tours = await Tour.find();

  // 2. Render that template using tour data from 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1. Get the data, for the requested tour (includeing reviews & guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  // 2. Build template

  // 3. Render template using the data from step 1

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour: tour
  });
});
