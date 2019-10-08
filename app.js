const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Database connection
require('./config/dbconn');

// Cors middleware
app.use(cors());

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route Files
const auth = require('./routes/api/v1/auth');
const profile = require('./routes/api/v1/profile');
const car = require('./routes/api/v1/car');
const order = require('./routes/api/v1/order');

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Use Routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/profile', profile);
app.use('/api/v1/car', car);
app.use('/api/v1/order', order);


const port = 7000;
app.listen(port, () => console.log(`Server runing on port ${port}`));
