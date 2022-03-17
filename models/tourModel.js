import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
// import User from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // This message will be the error message
      require: [true, 'A tour must have a name.'],
      unique: true,
      // validator
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // Third validator library
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a group size'],
      // validator
      enum: {
        // Allowed values. Only works for strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // validator
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      // will round the ratingsAverage everytime a new value is set (When a new review is created or deleted).
      set: (val) => Math.round(val * 10) / 10, //.round rounds values to intergers (4.666 will be rounded to 5). The solution is to multiply by ten then divede by 10 (4.6666 * 10 46.666 will be rounded to 47 /10 = 4.7.
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      // "trim" only works with Strings. It will trim the white space at the beginning and end.
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description.'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // will hide the field
      select: false,
    },
    startDates: [Date],
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    priceDiscount: {
      type: Number,
      // custome validator with a function. "this" points to the new document and has access to the user value for this field
      validate: {
        validator: function (value) {
          // returns an error is false
          return value < this.price;
        },
        // Error message. It also has access to the value
        message: 'Discount price ({VALUE}) should be below regular price.',
      },
    },
    startLocation: {
      // GeoJSON object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // Data needs to be embeded in an array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //EMBEDDED USER
    // guides: Array,
    // REFERENCE
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    // when data is send as json or an object the virtual fields will be set on the documents
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// INDEXES - create indexes for better mongodb performance
// 1 = ascending order -1 descending
// Single field index
// tourSchema.index({ price: 1 });
// Compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// VIRTUAL PROPERTIES

tourSchema.virtual('durationWeeks').get(function () {
  // "this" points to the current document
  return this.duration / 7;
});

// Virtual populate - this will be implemented on one tour not get all tours. This allows us to keep a child reference without persisting the
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// ********** MONGOOSE MIDDLEWARE
//  !!!!!!!! Make sure this code: const Tour = new mongoose.model('Tour', tourSchema); is after the middleware !!!!!!!!

// Document
// Pre - runs only before .save() and .create(). 'Next' is available in the "pre" middleware
tourSchema.pre('save', function () {
  this.slug = slugify(this.name);
});

// •••••For Embedding guides
// tourSchema.pre('save', async function (next) {
//   // return an  array of promises
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   // sets the this.guides to the data from guidesPromises
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   // The 'this' keyword is not available on .post() but the saved document is.
//   console.log(doc);
// });

// ********** QUERY MIDDLEWARE
// QUERY
// The "this" keyword points to the query and not a document
//use a regExp to add the findOne query
tourSchema.pre(/^find/, function (next) {
  // To "this" query we can chain another find() query
  this.find({ secretTour: false });
  //This will be added to the query object
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  // "this" points to the query
  this.populate({
    path: 'guides',
    select: '-v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATE

tourSchema.pre('aggregate', function (next) {
  // will add a match state at beggining of aggregate pipeline
  this.pipeline().unshift({ $match: { secretTour: false } });

  next();
});
// Model

// eslint-disable-next-line new-cap
const Tour = new mongoose.model('Tour', tourSchema);

export default Tour;

// ******TESTING *********
// creates an instace of the Tour model
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });

// the save methods saves the document to the database and returns a promise
// testTour
//   .save()
//   .then((doc) => {
//     // document that was saved to the database
//     console.log(doc);
//   })
//   .catch((err) => console.log(err));
