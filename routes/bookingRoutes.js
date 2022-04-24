import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

export default router;
