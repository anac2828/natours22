import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    // Will hide the password when the data is requested
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password.'],
    validate: {
      // This funtion will be called when the document is created. This only works on CREATE and SAVE!!!
      validator: function (value) {
        // returns true or false
        return value === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
  passwordChangedAt: Date,
});

// MIDDLEWARE

userSchema.pre('save', async function (next) {
  // "this" is the current document. If the password is not modified code the next middleware will run.
  if (!this.isModified('password')) return next();
  // The higher the number the better encrypted the password will be but the more cpu instensive thre process will be
  // A promise will be returned
  this.password = await bcrypt.hash(this.password, 12);

  // Setting the passwordConfirm to undefined will be deleted from the data. We only need this field for password validation
  this.passwordConfirm = undefined;
  next();
});

// ****** INSTANCE METHOD (available on all documents created with the User model) ******

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  // "this" keyword points to the current document so the this.password is not available because it is set to select false
  // The compare method will has the candidatePassword and then compare it to the hashed user password stored in mongoose. It will return true or false.
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPassChangedAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    //true - password was changed // 100 < 200
    return JWTTimestamp < passwordTimeStamp;
  }
  console.log(passwordTimeStamp, JWTTimestamp);
  // False not changed
  return false;
};

const User = new mongoose.model('User', userSchema);
export default User;
