const express = require('express');

const router = express.Router();

// @route   GET api/profile/test
// @desc    Testing profile route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Testing profile routes' }));

module.exports = router;