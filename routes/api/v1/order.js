const express = require('express');
const Order = require('../../../models/Order');

const router = express.Router();

// @route   POST /order
// @desc    Create a purchase order
// @access  Private
router.post('/', (req, res) => res.json({ msg: 'Purchase order created' }));

// @route   POST /order_id/status=accepted
// @desc    Mark an offer as accepted
// @access  Private
router.post('/order_id/status=accepted', (req, res) => res.json({ msg: 'Accepted purchase offer' }));

// @route   PATCH /order_id/price
// @desc    Update a purchase order price
// @access  Private
router.patch('/order_id/price', (req, res) => res.json({ msg: 'Purchase order price updated' }));

// @route   GET /user_id
// @desc    View all purchase orders by a user
// @access  Private
router.get('/user_id', (req, res) => res.json({ msg: 'View all purchase orders by a user' }));

// @route   GET /car_id
// @desc    View all purchase offers for a specific car
// @access  Private
router.get('/car_id', (req, res) => res.json({ msg: 'View all purchase offers  for a specific car' }));


// @route   DELETE /order_id/status=rejected
// @desc    Mark an offer as rejected
// @access  Private
router.post('/order_id/status=rejected', (req, res) => res.json({ msg: 'Rejected purchase offer' }));

module.exports = router;