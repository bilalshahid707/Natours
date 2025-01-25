const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const sendEmail = require('../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Email = require('../utils/email')
// HELPER FUNCTIONS

// SIGN TOKEN
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create Send Token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

// SIGN UP
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser,url).sendWelcome()
  createSendToken(newUser, 201, res);

});

// SIGN IN
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({
    email,
  }).select('+password');

  if (user && (await user.correctPassword(password, user.password))) {
    createSendToken(user, 200, res);
  } else {
    return next(new AppError('Inavlid email or password', 401));
  }
});

// PROTECTING ROUTES
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // CHECKING TOKEN EXISTS OR NOT
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }
  // VERIFYING TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // CHECKING IF USER EXISTS OR NOT
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to token does not exist', 401)
    );
  }
  // CHECKING IF USER HAS CHANGED PASSWORD OR  NOT
  if (currentUser.changedPassword(decoded.iat)) {
    return next(new AppError('Password Changed!', 401));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access Forbiden', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findOne({ email: req.body.email });
  // First we will check if user with the email exists or not
  if (!currentUser) {
    return next(new AppError('No user found with this email', 404));
  }

  // Creating reset token for user
  const resetToken = await currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });
  // Creating URL for email to be sent to user with token
  const resetURL = `${req.protocol}://${req.get('host')}${
    req.baseUrl
  }/resetpassword/${resetToken}`;
  try {
    await new Email(currentUser,resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    currentUser.passwordResetToken = undefined;
    currentUser.resetTokenExpiresIn = undefined;
    await currentUser.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email. Please try again', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresIn: { $gt: Date.now() },
  });
  // Checking if user exists or not
  if (!user) {
    return next(new AppError('Token Invalid', 400));
  }
  // Setting new Password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.resetTokenExpiresIn = undefined;
  this.passwordChangedAt = Date.now();
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.body)
  const currentUser = await User.findById(req.user.id).select('+password');
  if (
    !(await currentUser.correctPassword(
      req.body.currentPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError('Current Password is wrong', 401));
  }
  currentUser.password = req.body.newPassword;
  currentUser.confirmPassword = req.body.confirmPassword;
  currentUser.passwordChangedAt = Date.now();
  await currentUser.save();
  createSendToken(currentUser, 200, res);
});

// For Rendered Pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // CHECKING TOKEN EXISTS OR NOT
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    try {
      if (!token) {
        return next();
      }
      // VERIFYING TOKEN
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // CHECKING IF USER EXISTS OR NOT
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // CHECKING IF USER HAS CHANGED PASSWORD OR  NOT
      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      next();
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
});

exports.signOut = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'loggedOut', cookieOptions);
  res.status(200).json({ status: 'success' });
});
