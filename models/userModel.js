import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    require: [true, 'Please provide your email '],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'Please provide a password.'],
    minlength: 8,
  },
  passwordConfirmation: {
    type: String,
    require: [true, 'Please confirm your password.'],
  },
});

const User = mongoose.model('User', userSchema);

export default User;
