// This class is to set the status code and error message
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // This will be true when an error is caused by the user and that we create an error message for.
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}

export default AppError;
