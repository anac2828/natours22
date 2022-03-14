import Review from '../models/reviewModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  //Get all review for one tour using the nested tour and reviews end point
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  //"filter" will be an empty object when the /api/v1/reviews end point is called. Thus, all reviews for all tours we be sent to the client.
  const reviews = await Review.find(filter);

  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

export const createReview = catchAsync(async (req, res, next) => {
  console.log(req.params);
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({ status: 'success', data: { review } });
});
