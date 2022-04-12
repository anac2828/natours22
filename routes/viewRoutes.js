import express from 'express';
import * as viewController from '../controllers/viewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();



router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/signup', viewController.getSignUpForm);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get('/forgotpassword', viewController.getForgotPassForm);
router.get('/resetpassword/:resetToken', viewController.getResetPassForm);
router.get('/checkemail', viewController.getResendEmailForm);
router.get('/me', authController.protect, viewController.getAccount);
// END POINT TO SUBMIT USER DATA UPDATE FORM WHEN NOT USING API
// router.post(
//   '/update-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

export default router;
