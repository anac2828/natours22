import mongoose from 'mongoose';
import Tour from './tourModel.js';

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
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // when data is send as json or an object the virtual fields will be set on the documents
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // this.populate({ path: 'tour', select: 'name' }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  next();
});

// STATIC methods are used on a Model not the documents
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  // "this" keyword points to the Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      // $tour points to the field in the $match stage
      $group: {
        _id: '$tour',
        // will add the number of reviews for each tour
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // if the stats array is empty the ratingsAverage and the ratingsQuantity will be set to 4.5 and 0.
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// Middleware for review documents after they are saved. Post middleware does not have access to next()
reviewSchema.post('save', function () {
  // "this" points to the current document
  // use this.contructor to call the medthod on the Model and not the document. Since "Review" variable has not been declared, we need to use this.contructor
  // In "this.tour" is the tourId
  this.constructor.calcAvgRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // "this" points to the query. this.findOne() will find the current document to give us access to the tourId.
  // The review will be saved on the "this" query and be passed on to the next middleware. "this.clone()" will clone the query
  this.review = await this.clone().findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Use constructor to call the Model object to execute the static method "calcAvgRatings"
  await this.review.constructor.calcAvgRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
