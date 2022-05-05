import Stripe from 'stripe';
import * as factory from './handlerFactory.js';
import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// This creates a session for the user to use to make a payment
export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // Create checkout session - This will show up on the front end on the checkout form.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // if the user made a successful transaction they will be redirected to the homepage
    // req.params comes from when the user submits the request
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // send session to client
  res.status(200).json({ status: 'success', session });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookigns withou paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  // redirect creates a new request
  res.redirect(req.originalUrl.split('?')[0]);
});

// CRUD
export const createOneBooking = factory.createOne(Booking);
export const getAllBookings = factory.getAll(Booking);
export const getOneBooking = factory.getOne(Booking);
export const updateOneBooking = factory.updateOne(Booking);
export const deleteOneBooking = factory.deleteOne(Booking);