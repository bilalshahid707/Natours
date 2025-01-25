const express = require("express")
const Router = express.Router()
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const tourController = require('../controllers/tourControllers')
Router.use(authController.isLoggedIn)

Router.route("/").get(viewsController.getOverview)
Router.route("/tour/:slug").get(viewsController.getTour)
Router.route("/login").get(viewsController.login)
Router.route("/me").get(authController.protect,viewsController.getMe)
Router.get(
    '/my-tours',
    authController.protect,
    viewsController.getMyTours
  )
Router.route("/submit-user-data",viewsController.updateUserData)

module.exports = Router