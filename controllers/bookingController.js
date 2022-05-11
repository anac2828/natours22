import Stripe from 'stripe';
import * as factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';

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
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alerts=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // send session to client
  res.status(200).json({ status: 'success', session });
});

// export const createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookigns withou paying
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   // redirect creates a new request
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;

  await Booking.create({ tour, user, price });
};

export const webhookCheckout = (req, res, next) => {
  // TRY-CATCH is blocked scoped. Put event variable outside
  let event;
  try {
    // Stripe will add the signature to the headers when it calls the webhook
    const signature = req.headers['stripe-signature'];
    // req.body needs to be in a raw form (stream)
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(event);
  } catch (error) {
    // error will be sent to STRIPE
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  // EVENT FROM STRIPE
  if (event.type === 'checkout.session.completed')
    // will create the booking on MONGODB
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

// CRUD
export const createOneBooking = factory.createOne(Booking);
export const getAllBookings = factory.getAll(Booking);
export const getOneBooking = factory.getOne(Booking);
export const updateOneBooking = factory.updateOne(Booking);
export const deleteOneBooking = factory.deleteOne(Booking);