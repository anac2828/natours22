import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';

import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

// MIDDLEWARE Handler for use in the tourRoute.js
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// ************* TOUR ROUTE HANDLERS ***************
export const getAllTours = factory.getAll(Tour);
export const getTour = factory.getOne(Tour, { path: 'reviews' });
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour);
export const deleteTour = factory.deleteOne(Tour);

// export const deleteTour = catchAsync(async (req, res) => {
//   // no need to send the deleted object to the client
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) return next(new AppError('No tour with that ID', 404));

//   res.status(204).json({ status: 'success', message: 'Tour deleted' });
// });

// MONGODB AGGREGATION

export const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id  field is required. Set it to null if you dont' want to group by _id
        _id: '$difficulty',
        // fields added to tours
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // 1 is equal to sort by smallest to greatest
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

export const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = +req.params.id;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        // selects date for the year in the query
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //grups the tours by the month of the startDate
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        // creates an array with the name of the tours
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  res
    .status(200)
    .json({ status: 'success', results: plan.length, data: { plan } });
});
