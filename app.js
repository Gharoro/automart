const express = require('express');

const app = express();
// Database connection
require('./config/dbconn');
// Route Files
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const car = require('./routes/api/car');
const order = require('./routes/api/order');


app.get('/', (req, res) => res.send('Automart API'));

// Use Routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/car', car);
app.use('/api/order', order);


const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server runing on port ${port}`));
