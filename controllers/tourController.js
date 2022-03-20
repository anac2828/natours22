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

// '/tours-within/:distance/center/:latlng/unit/:unit';
export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // to get the radiance you divide the distance by the earth's radius in miles or distance by earth's radius in km
  const radiance = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      AppError(
        'Please provide a latitude and longitude in the format lat, lng.',
        400
      )
    );
  // startLocation is where the tour is located. $geoWithin will earch for tours within a certain radius. $centerSphere takes an array of lng, lat where to start the search and the radius is the distance in miles or km
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radiance] } },
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { Tour: tours } });
});

// '/distances/:latlng/unit/:unit'
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    next(
      AppError(
        'Please provide a latitude and longitude in the format lat, lng.',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        // near is the point from which to calculate the distances between the near point and the startLocation of the tours
        near: { type: 'Point', coordinates: [+lng, +lat] },
        // all calculated distances will be store here
        distanceField: 'distance',
        // will conver to miles or km
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        // field in the geoNear stage
        distance: 1,
        name: 1,
        // this is so project works since we are using an aggregae middleware in the tourmodel
        secretTour: 1,
      },
    },
  ]);

  res.status(200).json({ status: 'success', data: { distances } });
});

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

// ************** MONGODB AGGREGATION

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
