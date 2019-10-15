const Counter = require('../models/Counters');

module.exports = function getNextSequenceValue(sequenceName) {
  const sequenceDoc = Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $set: { sequence_value: 1 } },
    { new: true },
  );
  return sequenceDoc.sequence_value;
};