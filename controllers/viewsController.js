const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel.js')

exports.getOverview = catchAsync(async (req, res) => {
  const response = await fetch('/api/v1/tours');
  const jsonResponse = await response.json();
  const tours = await jsonResponse.data;
  res.status(200).render('overview', {
    tours,
    title: 'All Tours',
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    'reviews'
  );
  if (!tour) {
    return next(new AppError('No tour found', 404));
  }
  res.status(200).render('tour', {
    tour: tour,
    title: tour.name,
  });
});

exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login');
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).render('account');
});

exports.getMyTours = catchAsync(async(req,res,next)=>{
  const bookings = Booking.find({user:req.user.id})
  res.status(200).render('bookings')
})
