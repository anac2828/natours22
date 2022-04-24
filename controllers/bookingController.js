import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// This creates a session for the user to use to make a payment
export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

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
