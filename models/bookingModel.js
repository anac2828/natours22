import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // parent referencing
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// Populate tour and user on a QUERY 
bookingSchema.pre(/^find/, function (this) {
  // when you want to populate only some fields use the object options
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  })
 })

export const Booking = mongoose.model('Booking', bookingSchema);
