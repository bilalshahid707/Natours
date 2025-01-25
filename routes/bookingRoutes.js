const express = require('express');
const Router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
// ROUTES
Router.route('/checkout-session/:tourId').get(
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = Router;
