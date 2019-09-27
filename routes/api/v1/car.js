const express = require('express');

const router = express.Router();

// @route   POST /car/
// @desc    Create a car sale ad
// @access  Private
router.post('/', (req, res) => res.json({ msg: 'Car ad created' }));

// @route   PATCH /car_id/status
// @desc    Mark a posted car ad as sold
// @access  Private
router.patch('/car_id/status', (req, res) => res.json({ msg: 'Car marked as sold' }));

// @route   PATCH /car_id/price
// @desc    Update the price of a car
// @access  Private
router.patch('/car_id/price', (req, res) => res.json({ msg: 'Car price updated' }));

// @route   GET /car_id
// @desc    View a specific car
// @access  Public
router.get('/car_id', (req, res) => res.json({ msg: 'This is a specific car' }));

// @route   GET /status=available
// @desc    View all unsold cars
// @access  Public
router.get('/status=available', (req, res) => res.json({ msg: 'View all unsold cars' }));

// @route   GET /status=available&min_price=20000&max_price=50000
// @desc    View all unsold cars within a price range
// @access  Public
router.get('/status=available&min_price=20000&max_price=50000', (req, res) => res.json({ msg: 'View all unsold cars within a price range' }));

// @route   DELETE /car_id
// @desc    Delete a specific car
// @access  Private
router.delete('/car_id', (req, res) => res.json({ msg: 'Car deleted succesffuly' }));

// @route   GET /car
// @desc    View all posted car ads
// @access  Public
router.get('/', (req, res) => res.json({ msg: 'View all posted car ads' }));

// @route   GET /car/user_id
// @desc    View all posted car ads by a user
// @access  Private
router.get('/user_id', (req, res) => res.json({ msg: 'View all posted car ads by a user' }));

// @route   GET /status=available&state=new
// @desc    View all new unsold cars
// @access  Public
router.get('/status=available&state=new', (req, res) => res.json({ msg: 'View all new unsold cars' }));

// @route   GET /status=available&state=used
// @desc    View all used unsold cars
// @access  Public
router.get('/status=available&state=used', (req, res) => res.json({ msg: 'View all used unsold cars' }));

// @route   GET /status=available&manufacturer=audi
// @desc    View all unsold cars by a manufacturer
// @access  Public
router.get('/status=available&manufacturer=audi', (req, res) => res.json({ msg: 'View all unsold cars by a manufacturer' }));

// @route   GET /body-type=bodyType
// @desc    View all cars of a specific bodytype
// @access  Public
router.get('/body-type=bodyType', (req, res) => res.json({ msg: 'View all cars of a specific body type' }));


module.exports = router;