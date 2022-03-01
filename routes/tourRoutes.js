import express from 'express';
import * as tourController from '../controllers/tourController.js';

const router = express.Router();

// MIDDLEWARE
// For routes that have an 'id' route
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// ROUTES
// The "/" is the root of the tours url
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:id').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

export default router;
