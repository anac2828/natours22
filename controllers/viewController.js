import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';


// ALL TOURS PAGE

export const getOverview = catchAsync(async (req, res, next) => {
  // Get tour data
  const tours = await Tour.find();
  //Build template
  //Render template
  res.status(200).render('overview', { title: 'All Tours', tours });
});

// TOUR DETAILS PAGE

export const getTour = catchAsync(async (req, res, next) => {
  
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


// USER LOGIN

export const getLoginForm = (req, res) => {

  res.status(200).render('login', {title: 'Log in'})
 }
