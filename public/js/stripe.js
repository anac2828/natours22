import axios from 'axios';
import { showAlert } from './showAlerts.js';
const stripe = Stripe(
  'pk_test_51H8h40Hf9DmQOW8iHHfSWJSkY0A2ZmfvndCiewTIXPjmTsad2oY8kHixIHrX1pFnQodyggLCoNy0EkwbffvR5xtQ00DOhpsSkO'
);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from API

    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // Create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
