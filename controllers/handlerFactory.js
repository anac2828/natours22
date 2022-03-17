import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/APIFeatures.js';

export const getAll = (Model) =>
  catchAsync(async (req, res) => {
    const { modelName } = { ...Model };
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

    //Get all reviews for one tour using the nested tour and reviews end point (/api/v1/tours/tourId/reviews).
    //"filter" will be an empty object when the /api/v1/reviews end point is called. Thus, all reviews for all tours will be sent to the client.
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // ******** EXECUTE QUERY

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    //
    const docs = await features.query;

    // ****** SEND RESPONSE

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { [modelName]: docs },
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { modelName } = { ...Model };

    let query = Model.findById(req.params.id);
    // this will populate the reviews on a tour
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    // creates an error object that will be received in the app.use errorhandler middleware and the errorController will be called to display the error in postman
    if (!doc) return next(new AppError('No document with that ID', 404));

    res.status(200).json({ status: 'success', data: { [modelName]: doc } });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { modelName } = { ...Model };
    // If the Model.create promise is rejected the error will show in the catch block
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { [modelName]: doc } });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // model name
    const { modelName } = { ...Model };

    // "new: true" returns the updated tour.
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document with that ID', 404));

    res.status(200).json({ status: 'success', data: { [modelName]: doc } });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // no need to send the deleted object to the client
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document with that ID', 404));

    res.status(204).json({ status: 'success', message: 'Document deleted' });
  });
