import AppError from '../utils/appError.js';

// ********** ERROR HANDLERS *************
const handleCastErrorDB = (err) => {
  //err is from MongoDB
  const message = `Invalid ${err.path}: ${err.value}`;
  // 400 bad request
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.message.match(/(["])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidatorErrordDB = (err) => {
  const errors = Object.values(err.errors).map((value) => value.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// ********** SEND ERROR HANDLERS *************

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrProd = (err, res) => {
  // The error object comes from the AppError class.
  // This is a save error to display to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // 1) Log error for developer
  console.error(`ERROR *****`, err);

  // 2) Send generic message to client
  // Programming or other unknown error: don't leak error details to client.
  res
    .status(500)
    .json({ status: 'error', message: 'Something went very wrong!' });
};

// This is to catch global errors and send the message and status code. We get access to err, req, res, next from the app.use middleware where this function will be called
export default (err, req, res, next) => {
  // if the code is 500 the status is 'error' if it 400 status is fail
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    // creates a copy of the err object so that we dont' overwrite the err object message
    // let error = {
    //   ...err,
    //   message: err.message,
    //   name: err.name,
    //   code: err.code,
    // };

    let error = Object.assign(err);

    // The err will be created by mongoDB. The handleCastErrorDB function will return a new error using the AppError class with a message that can be passed to the client instead of the mongoDB message
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidatorErrordDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();
    sendErrProd(error, res);
  }
};
