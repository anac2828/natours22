import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const filterObj = (obj, ...allowedFields) => {
  // ...allowedFields will be an array
  //Object.keys() will return an array of the object keys
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ********** UPDATE LOGGED IN USER INFO BY USER **********
export const updateMe = catchAsync(async (req, res, next) => {
  //Create error if user try to update passwords in this route
  // req.body.hasOwnProperty('password', 'passwordConfirm');
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('Please go to /updatepassword to update your password.', 404)
    );

  // filter for not allowed fields to update
  const filteredData = filterObj(req.body, 'name', 'email');
  console.log(filteredData);
  //UPDATE USER DOCUMENT
  // use findByIdAndUpdate for updating non sensitive data.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredData, {
    // new: true will return the updated object
    new: true,
    runValidators: true,
  });
  console.log(req.user.id);

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// ************* USER ROUTE HANDLERS ***************

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // const users = await User.find({ active: { $ne: false } });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

export const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yer defined',
  });
};
export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yer defined',
  });
};
export const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yer defined',
  });
};
export const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yer defined',
  });
};
