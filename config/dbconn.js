/* eslint-disable comma-dangle */
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.DEV_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
} else {
  mongoose.connect(process.env.PROD_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

mongoose.connection
  .once('open', () => console.log('Connected to mongo database...'))
  .on('error', (err) => {
    console.log('Error connecting to database!', err);
  });
