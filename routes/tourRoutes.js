const express = require('express');
const Router = express.Router();
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
// ROUTES
// Router.route('/create-checkout-session').post(tourController.checkOut)
Router.use('/:id/reviews', reviewRouter);
Router.route('/top-5-cheapest').get(
  tourController.topFive,
  tourController.getAllTours
);
Router.route("/tours-within/:distance/center/:latLon/unit/:unit").get(tourController.toursWithin)
Router.route("/distances/:latLon/unit/:unit").get(tourController.getDistances)
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'guide', 'lead-guide'),
  tourController.getMonthlyPlan
);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide','guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.createTour
  );
Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide','guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
