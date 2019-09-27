const express = require('express');

const router = express.Router();

// @route   GET api/order/test
// @desc    Testing order route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Testing order routes' }));

module.exports = router;