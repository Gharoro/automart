/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  profile_pic: [
    {
      public_ID: {
        type: String,
        required: true
      },
      public_url: {
        type: String,
        required: true
      },
    }
  ],
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  joined: {
    type: Date,
    default: Date.now
  },
  is_admin: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
