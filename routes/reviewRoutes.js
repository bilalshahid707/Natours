const express = require('express');
const Router = express.Router({mergeParams:true});
const reviewController = require('../controllers/reviewControllers');
const authController = require('../controllers/authController');
// ROUTES
Router.use(authController.protect)
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setIds,
    reviewController.createReview
  );
Router.route('/:id').patch(authController.restrictTo('user'),reviewController.updateReview)

module.exports = Router;
