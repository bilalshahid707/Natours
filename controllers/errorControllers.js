const AppError = require('../utils/appError');

const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}:${err.value}`, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid data ${errors.join(',')}`, 400);
};
const handleInvalidToken = (err) => {
  return new AppError('Inavlid Token! Please log in again', 401);
};
const handleExpiredToken = (err) => {
  return new AppError('Token expired! Please log in again', 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req,res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.log('ERROR', err);

      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        msg: err.message,
      });
    } else {
      console.log('ERROR', err);

      res.status(err.statusCode).render('error', {
        msg: 'Please try again later',
      });
    }
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleInvalidToken(err);
    if (err.name === 'TokenExpiredError') err = handleExpiredToken(err);

    sendErrorProd(err,req, res);
  }
};
