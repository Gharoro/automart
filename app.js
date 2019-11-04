const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const responseTime = require('response-time')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Cors middleware
app.use(cors());

app.use(responseTime());

// Environment variable middleware
require('dotenv').config();

// Database connection
require('./config/dbconn');

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    greetings: 'Hello there!',
    message: 'This is the AutoMart API landing page',
    author: 'Gharoro Pureheart',
    github: 'https://github.com/Gharoro/automart-api',
    documentation: 'https://auto-mart-api.herokuapp.com/api-docs',
  });
});


const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server runing on port ${port}`));
