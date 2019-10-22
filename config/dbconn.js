/* eslint-disable consistent-return */
/* eslint-disable comma-dangle */
const mongoose = require('mongoose');


if (process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.DEV_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
} else {
  mongoose.connect(process.env.PROD_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
}


mongoose.connection
  .once('open', () => console.log('Connected to database...'))
  .on('error', (error) => console.log('Error connecting to database!', error));
