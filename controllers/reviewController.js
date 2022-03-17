import Review from '../models/reviewModel.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

export const getAllReviews = factory.getAll(Review);

export const setTourUserIds = (req, res, next) => {
  // ids will be set when the /api/v1/tours/tourId/reviews is used
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
