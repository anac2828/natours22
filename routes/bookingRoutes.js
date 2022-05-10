import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// front end route
router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateOneBooking)
  .delete(bookingController.deleteOneBooking);

export default router;
