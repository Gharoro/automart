const express = require('express');
const passport = require('passport');

const router = express.Router();

// @route   GET api/profile/
// @desc    User profile route
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => res.status(200).json(
  {
    User: {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
      profilePic: req.user.profilePic,
      phone: req.user.phone,
      address: req.user.address,
      email: req.user.email,
    },
  },
));

module.exports = router;