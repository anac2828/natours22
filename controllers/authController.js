import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

// Will create a signature token to send to the user when they login or signup
const signToken = (id) => {
  // jwt.sign() will create a signature everytime a user logs in
  // ** params - payload // secretKey // options // callback
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  // will only send the cookie over an https request

  // will prevent the browser from modifying the cookie. It will prevent cross-site attacks
  httpOnly: true,
};

if (process.env.NODE_DEV === 'production') cookiesOptions.secure = true;

const createNSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // create and send a cookie to browser. Expires in 90 days (converted to milliseconds). The cookie is the token
  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

// ******** SIGN UP AND LOG IN ************

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

  // const token = signToken(newUser._id);
  // // When a user is created they will be signed in.
  // res.status(201).json({ status: 'success', token, data: { user: newUser } });

  createNSendToken(newUser, 201, res);
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
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });

  createNSendToken(user, 200, res);
});

// ******** PROTECT ************

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
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission for this action", 403)
      );
    next();
  };
};

// ********** PASSWORD RESET **********
export const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user with email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with that email address.', 404));
  //Generate random reset token

  const resetToken = user.createPasswordResetToken();

  // We need to save the user so that the encrypted token and expired time are save to the database after the createPasswordResetToken is called
  await user.save();

  // Link that will be sent to user via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  //user will get an email with a link to reset the password
  const message = `Forgot your password? Click here ${resetURL} to request a new password. \n If you din't forget your password, please ignore this email!`;

  try {
    // function email.js
    await sendEmail({
      email: user.email,
      subject: 'Your password rest request (valid for 10 min)',
      message,
    });

    res
      .status(200)
      .json({ status: 'success', message: 'Reset link sent to email!' });
  } catch (error) {
    // if there is an error with sending the email the error will be thrown here
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(
      new AppError('There was an error sending the email. Try again later!')
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // Find user with token sent to them. The token sent to use was not encrypted and rest token in the data is encrypted. Encryp user token to be able to find the user.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //find user with token that has not expired
  const [user] = await User.find({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError('Your token is invalid or has expired', 400));

  //save new user password the database and delete reset token by using undefined.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // create and send a new token signature
  // const token = signToken(user._id);

  // res.status(200).json({ success: 'success', token });

  createNSendToken(user, 200, res);
});

// ********** UPDATE PASSWORD

export const updatePassword = catchAsync(async (req, res, next) => {
  //Get user
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('There is no user with that email', 404));

  // Check if current password is corrent
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('The password you entered is incorrect', 404));

  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //Log user in send JWT
  // const token = signToken(user._id);
  // res.status(200).json({ status: 'success', token });
  createNSendToken(user, 200, res);
});
