import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res) => {
  // Get tour data
  const tours = await Tour.find();
  //Build template
  //Render template
  res.status(200).render('overview', { title: 'All Tours', tours });
});

export const getTour = catchAsync(async (req, res) => {
  console.log(req.params);
  // Get tour data
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //Render template using data

  res.status(200).render('tour', { tour, title: tour.name });
});
