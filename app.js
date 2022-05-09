// solution for __dirname is not defined in ES module scope error
import path from 'path';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
// compresses code send to client
import compression from 'compression';
// ****
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const __dirname = path.resolve();

const app = express();


// enable trust proxy (heroku) so heroku will set the req.headers('x-forwarded-proto')
app.enable('trust proxy')

// ********** VIEW ENGINE
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

// // // // // // // // // // // ************** SERVING STATIC FILES
// Gives access to the public folder in the url. The public folder is the root folder. It will only work for static files and will not go into subfolders.
//http://localhost:3000/overview.html
app.use(express.static(`${__dirname}/public`));

// **************************** GLOBAL MIDDLEWARE
//
if (process.env.NODE_ENV === 'development')
  // will log info about the request on the terminal
  app.use(morgan('dev'));

// ******* SECURY MIDDLEWARE
//// // // // Limits the amount of request to 100 per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Sets security http headers - helmet() will return a function This should go at the beginning.
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet.referrerPolicy({ policy: ['strict-origin-when-cross-origin'] })
  );
}



// // // // // *************  BODY PARSER
// limit that amount of data that comes in the body for security purposes.
// gets access to the body in request
app.use(express.json({ limit: '10kb' }));
// get access to form data not using the API request. Use extends true for more complex data submition
app.use(express.urlencoded({ extends: true, limit: '10kb' }));
// gets access to the cookie in a request when a user logs in
app.use(cookieParser());

// ******************* SECURITY
// Data sanitization againts NoSQL query injection - Will remove '$' from a query
app.use(mongoSanitize());

// Data sanitization againts CROSS SITE - cleans user input from malicious HTML input
app.use(xss());

// Prevent parameter polution  - will remove duplicate fields
app.use(
  hpp({
    whitelist: [
      'duartion',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//
// COMPRESSES TEXT THAT IS SEND TO CLIENT (JSON)
app.use(compression());
//

// // // // // // // // // // //
// applies to every route because a route was not specified and it comes before the route handler
app.use((req, res, next) => {
  // The time will be added to the request object and will be available on all requests
  req.requestTime = new Date().toLocaleString();

  next();
});

// ********************* ROUTES MIDDLEWARE

// FRONT END ROUTE
app.use('/', viewRouter);

// Middleware for tours route
// When there is request for the tours route the tourRouter sub application will run.
// This is called mounting the router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings/', bookingRouter);

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
