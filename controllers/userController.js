// For importing user image photo
// import multer from 'multer';
// Resize image library
import sharp from 'sharp'
import {upload} from '../utils/multer.js'
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';


// // ********* MULTER CONFIG ************

// // // will store the file as an image not a string
// // const multerStorage = multer.diskStorage({
// //   destination: (req, file, callback) => {
// //     // callback first argument is an error or null if no error. Second arg is the file path where image will be saved.
// //     callback(null, 'public/img/users');
// //   },
// //   filename: (req, file, callback) => {
// //     // file comes from the req.file when the upload middleware is used.
// //     const ext = file.mimetype.split('/')[1];
// //     // callback first argument is an error or null if no error. Second arg is the file name that will be given to the image.
// //     callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
// //   },
// // });

// // Image will be store as a buffer so we can use sharp to resize image
// const multerStorage = multer.memoryStorage()

// // If file is an image the callback will recive true if not false and will create an error
// const multerFilter = (req, file, callback) => {
//   if (file.mimetype.startsWith('image')) return callback(null, true);

//   callback(
//     new AppError('Not an image! Please upload only images.', 400),
//     false
//   );
// };

// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// *********
const filterObj = (obj, ...allowedFields) => {
  // ...allowedFields will be an array
  //Object.keys() will return an array of the object keys
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ******* MIDDLEWARE

// multer middleware
export const uploadUserPhoto = upload.single('photo');
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // req.file.buffer comes from the multer.memoryStorage()
  // resize image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});


// set the user id to req.params.id for the factory.getOne() to work
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// ********** UPDATE LOGGED IN USER INFO BY USER **********
export const updateMe = catchAsync(async (req, res, next) => {
  //Create error if user try to update passwords in this route
  // req.body.hasOwnProperty('password', 'passwordConfirm');
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('Please go to /updatepassword to update your password.', 404)
    );

  // filter for not allowed fields to update by user
  const filteredData = filterObj(req.body, 'name', 'email');
  if (req.file) filteredData.photo = req.file.filename;

  //UPDATE USER DOCUMENT
  // use findByIdAndUpdate for updating non sensitive data.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredData, {
    // new: true will return the updated object
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// ************* USER ROUTE HANDLERS ***************

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead.',
  });
};

export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
