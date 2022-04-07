import express from 'express';
import * as tourController from '../controllers/tourController.js';
import * as authController from '../controllers/authController.js';
import * as reviewController from '../controllers/reviewController.js';
import reviewRouter from '../routes/reviewRoutes.js';

const router = express.Router();

// MIDDLEWARE
// For routes that have an 'id' route
// router.param('id', tourController.checkID);

// NESTED ROUTES
// /tour/325134/reviews
// tour/2341234/reviews/6786876

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

// MIDDLEWARE - this route will be redirected to the viewRouter
router.use('/:tourId/reviews', reviewRouter);

//********* ROUTES
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// The "/" is the root of the tours url
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// ** GEO SPACIAL ROUTES
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

// will calculate the distance of all routes from a starting point
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//********* RESTFUL ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

export default router;
