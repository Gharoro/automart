const express = require('express');

const router = express.Router();

// @route   GET api/auth/test
// @desc    Testing auth route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Testing auth route' }));

module.exports = router;