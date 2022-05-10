import express from 'express';
import * as viewController from '../controllers/viewController.js';
import * as authController from '../controllers/authController.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/signup', viewController.getSignUpForm);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get('/forgotpassword', viewController.getForgotPassForm);
router.get('/resetpassword/:resetToken', viewController.getResetPassForm);
router.get('/checkemail', viewController.getResendEmailForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// END POINT TO SUBMIT USER DATA UPDATE FORM WHEN NOT USING API
// router.post(
//   '/update-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

export default router;
