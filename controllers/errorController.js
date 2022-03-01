import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  //err is from MongoDB
  const message = `Invalid ${err.path}: ${err.value}`;
  // 400 bad request
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.match(/(["])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleValidatorErrordDB = (err) => {
  const errors = Object.values(err.errors).map((value) => value.message);
  const message = `Invalid input data. ${errors.joing('. ')}`;
  return new AppError(message, 400);
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
  err.statusCode = err.statusCode || 500;
  // if the code is 500 the status is 'error' if it 400 status is fail
  err.status = err.status || 'error';
  const errors = Object.values(err.errors).map((value) => value.message);

  console.log(errors.join('. '));

  if (process.env.NODE_ENV === 'development') {
    // if (error.code === 11000) error = handleDuplicateFieldDB(error);
    sendErrDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    // creates a copy of the err object so that we dont' overwrite the err object message
    let error = { ...err };

    // The err will be created by mongoDB. The handleCastErrorDB function will return a new error using the AppError class with a message that can be passed to the client instead of the mongoDB message
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(err.message);
    if (error.name === 'ValidatorError') error = handleValidatorErrordDB(error);
    sendErrProd(error, res);
  }
};
