/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer_id: {
    type: String,
    required: true
  },
  buyer_email: {
    type: String,
    required: true
  },
  car_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
