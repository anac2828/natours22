import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please enter a review.'],
    },
    rating: {
      type: Number,
      required: [true, 'Please rate this tour from 1-5.'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user'],
    },
  },
  {
    // when data is send as json or an object the virtual fields will be set on the documents
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
