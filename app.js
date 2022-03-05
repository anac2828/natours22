// solution for __dirname is not defined in ES module scope error
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const __dirname = path.resolve();

const app = express();

// ********* MIDDLEWARE
// BODY PARSER
app.use(express.json());
if (process.env.NODE_ENV === 'development')
  // will log info about the request on the terminal
  app.use(morgan('dev'));

// Gives access to the public folder in the url. The public folder is the root folder. It will only work for static files and will not go into subfolders.
//http://localhost:3000/overview.html
app.use(express.static(`${__dirname}/public`));

// applies to every route because a route was not specified and it comes before the route handler
app.use((req, res, next) => {
  // The time will be added to the request object and will be available on all requests
  req.requestTime = new Date().toLocaleString();

  next();
});

// ROUTES MIDDLEWARE

// Middleware for tours route
// When there is request for the tours route the tourRouter sub application will run.
// This is called mounting the router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//app.all will handle errors for .get(), .path(), .post(), .delete(). If a route is not defined app.all will send an error the the app.use(globalErrorHandler) middleware.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   // req.originalUrl is the url that was requested
  //   message: `Can't find ${req.originalUrl}`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // When something is passed onto next, it assums it is an error and will skip the rest of the middleware and send the error to the error middleware
  // This error will be sent to the error middleware handler below
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// express error handling middleware that only is called when there is an error

// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   // if the code is 500 the status is 'error' if it 400 status is fail
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({ status: err.status, message: err.message });
// });

// ******** ERROR MIDDLEWARE HANDLER
app.use(globalErrorHandler);

// export for use in server.js
export default app;
