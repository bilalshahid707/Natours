const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

// ROUTES
// Common Routes
Router.post('/signup', authController.signUp);
Router.post('/signin', authController.signIn);
Router.get('/signout', authController.signOut);
Router.post('/forgotpassword', authController.forgotPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);

// Protected Routes
Router.use(authController.protect)
Router.post(
  '/me',
  userController.getMe,
  userController.getUser
);

Router.patch(
  '/updatepassword',
  authController.updatePassword
);
Router.patch('/updateme',userController.uploadUserPhoto,userController.resizePhoto,userController.updateMe);
Router.delete('/deleteme', userController.deleteMe);

Router.use(authController.restrictTo("admin","lead-guide","guide"))
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = Router;
