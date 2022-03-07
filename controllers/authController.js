import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Will create a signature token to send to the user when they login or signup
const signToken = (id) => {
  // jwt.sign() will create a signature everytime a user logsin
  // ** params - payload // secretKey // options // callback
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // SECURITY BUG - Don't use this code. A user could sign up as an admin
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role || 'user',
  });

  const token = signToken(newUser._id);
  // When a user is created they will be signed in.
  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if there is a password and email
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  // check if user exists and password is correct. Password is set to "select: false", in the user model. Setting "select" to: '+password' will display the password.
  const [user] = await User.find({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password'), 401);

  // Send token if everything is ok.
  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

export const protect = catchAsync(async (req, res, next) => {
  // Getting token from headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );

  // Verification token - will check if the token is valid. It will return the payload which has the user's id
  // promisify will return a promise from jwt.verify function

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user still exits
  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401)
    );
  }

  // Check if user changed password after the token was issued
  // method from the userModel.js
  if (currentUser.checkPassChangedAfterToken(decodedToken.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  // next will grant access to protected route
  req.user = currentUser;
  next();
});

// this works be because of 'closures'. restrictTo returns a function and the returned function has access to the "...roles" array
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission for this action", 403)
      );
    next();
  };
};

export const forgotPassword = (req, res, next) => {
  // Get user with email
  const user = await User.findOne({ email: req.email });

  if (!user)
    return next(new AppError('There is no user with that email address.', 404));
  //Generate random reset token
};
export const resetPassword = (req, res, next) => {};
