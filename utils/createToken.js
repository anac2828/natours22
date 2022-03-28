import jwt from 'jsonwebtoken';

// Will create a signature token to send to the user when they login or signup
const signToken = (id) => {
  // jwt.sign() will create a signature token everytime a user logs in
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

export const createNSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // create and send a cookie to browser when a user signs in. Expires in 90 days (converted to milliseconds). The cookie is the token
  res.cookie('jwt', token, cookieOptions);

  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};
