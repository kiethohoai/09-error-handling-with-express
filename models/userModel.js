const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    require: [true, 'Please tell us your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: 8,
    maxlength: 20,
    select: false
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    // This validate only works on CREATE & SAVE
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not the same, please try again!'
    }
  }
});

// Hash password and save to DB
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password & delete passwordConfirm field
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
