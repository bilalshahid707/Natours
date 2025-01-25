const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {

  // 1) Get the tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    client_reference_id: req.user.id,
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
            description: tour.summary,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/success.html`,
  });
  req.session=session
  res.status(200).json({
    status:'success',
    data:session
  })
});
