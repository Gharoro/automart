/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'available'
  },
  price: {
    type: Number,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  body_type: {
    type: String,
    required: true
  },
  image: [
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
  date: {
    type: Date,
    default: Date.now
  }
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
