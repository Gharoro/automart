/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');

const router = express.Router();

// @route   GET api/profile/
// @desc    User profile route
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => res.status(200).json(
  {
    status: 200,
    current_user: {
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      profile_pic: req.user.profile_pic,
      phone: req.user.phone,
      address: req.user.address,
      email: req.user.email,
      joined: req.user.joined,
    },
  },
));

module.exports = router;