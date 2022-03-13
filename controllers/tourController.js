import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';

// MIDDLEWARE Handler for use in the tourRoute.js
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// ************* TOUR ROUTE HANDLERS ***************
export const getAllTours = catchAsync(async (req, res) => {
  // ***** BUILD QUERY
  // creates a copy of the req.query object
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // // ************* Advanced filtering
  // // conver to string to be able to replace the "gte" options
  // let queryString = JSON.stringify(queryObj);
  // //'g' at the end will replace all intances
  // queryString = queryString.replace(
  //   /\b(gte|gt|lte|lt)\b/g,
  //   (match) => `$${match}`
  // );

  // // Don't use await here to allow for chaining
  // let query = Tour.find(JSON.parse(queryString));

  // ******** SORTING
  // if (req.query.sort) {
  //   // replace ',' with a 'space' for mongodb to work when there are more than one sort values
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);

  //   // mongodb sort format
  //   // sort('price ratingsAverate')
  // } else query = query.sort('-createdAt');

  // // *************** FIELD LIMITING
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   // Shows only the fields selected
  //   query = query.select(fields);
  // } else query = query.select('-__v');

  // // ******** PAGINATION

  // //if there is no page the default is 1
  // const page = +req.query.page || 1;
  // const limit = +req.query.limit || 100;

  // // page=3&limit=10, results 1-10 page 1, 11-20 page 2, 21-30 page 3. In this example the 20 results will be skiped and page 3 results will be shown.
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('This page does not exist.');
  // }
  // mongoose methods for query
  // const query = Tour.find()
  //   .where('duration')
  //   .query(5)
  //   .where('difficulty')
  //   .equals('easy');

  // ******** EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;

  // ****** SEND RESPONSE

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // creates an error object that will be received in the app.use errorhandler middleware and the errorController will be called to display the error in postman
  if (!tour) return next(new AppError('No tour with that ID', 404));

  res.status(200).json({ status: 'success', data: { tour } });
});

export const createTour = catchAsync(async (req, res) => {
  // If the Tour.create provies is rejected the error will show in the catch block
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { tour: newTour } });
});

export const updateTour = catchAsync(async (req, res, next) => {
  // "new: true" returns the updated tour.
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) return next(new AppError('No tour with that ID', 404));

  res.status(200).json({ status: 'success', data: { tour } });
});

export const deleteTour = catchAsync(async (req, res) => {
  // no need to send the deleted object to the client
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No tour with that ID', 404));

  res.status(204).json({ status: 'success', message: 'Tour deleted' });
});

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
