import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Booking from '../models/bookingModel.js';

// This alert will be accessiable on pug templates. (STRIPE WEBKHOOK WORKAROUND)
export const alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

// ALL TOURS PAGE

export const getOverview = catchAsync(async (req, res, next) => {
  // Get tour data
  const tours = await Tour.find();
  //Build template
  //Render template
  res.status(200).render('overview', { title: 'All Tours', tours });
});

// TOUR DETAILS PAGE

export const getTour = catchAsync(async (req, res, next) => {
  // Get tour data
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // App errors to display to browser. The message will be handled by the errorController.js
  if (!tour) return next(new AppError('There is no tour with that name', 404));
  //Render template using data

  res.status(200).render('tour', { tour, title: tour.name });
});

// SIGN UP

export const getSignUpForm = (req, res) => {
  res.status(200).render('signup', { title: 'Sign up' });
};

// USER LOGIN

export const getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log in' });
};

// ******************************
// ******************************
// FORGOT PASSWORD

export const getForgotPassForm = (req, res) => {

  res
    .status(200)
    .render('forgotEmail/forgotPass', { title: 'Forgot password' });
};

// RESET PASSWORD
export const getResetPassForm = (req, res) => {
  res.status(200).render('forgotEmail/resetPassword', {
    title: 'Reset password',
    resetToken: req.params.resetToken,
  });
};

// RESEND EMAIL LINK
export const getResendEmailForm = (req, res) => {
  res.status(200).render('forgotEmail/checkEmail', {
    title: 'Check your e-mail',
  });
};

// USER ACCOUNT

export const getAccount = catchAsync(async (req, res, next) => {
  // user data is already saved in the res.locals because of the protect route
  res.status(200).render('account', { title: 'Your Account' });
});

// GET MY TOURS

export const getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', { title: 'My Bookings', tours });
});

//UPDATE USER DATA - IF NOT USING API
// export const updateUserData = catchAsync(async (req, res) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res
//     .status(200)
//     .render('account', { title: 'Your Account', user: updatedUser });
// });
