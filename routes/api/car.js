const express = require('express');

const router = express.Router();

// @route   GET api/car/test
// @desc    Testing car route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Testing car routes' }));

module.exports = router;