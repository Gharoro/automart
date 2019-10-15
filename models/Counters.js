/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

const countersSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    required: true
  },
}, { _id: false });

const Counter = mongoose.model('Counter', countersSchema);
module.exports = Counter;
