/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');

const User = require('../../../models/User');

const router = express.Router();

// @route   GET api/profile/
// @desc    User profile route
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => res.status(200).json(
  {
    status: 200,
    currentUser: {
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

// @route   PATCH /personal
// @desc    Update user personal information
// @access  Private
router.patch('/personal', passport.authenticate('jwt', { session: false }), (req, res) => {
  const current_user_id = req.user.id;
  let { firstName, lastName, username } = req.body;
  User.findOne({ where: { id: current_user_id } }).then((user) => {
    if (!user) {
      return res.status(404).json({ status: 404, no_user: 'User does not exist' });
    }
    User.update(
      { firstName, lastName, username },
      { where: { id: current_user_id }, returning: true },
    ).then((newUser) => {
      if (newUser[0] === 0) {
        return res.status(400).json({ status: 400, update_err: 'Unable to update user personal info.' });
      }
      res.status(200).json({ status: 200, update_personal: 'Personal info updated successfully' });
    });
  }).catch((err) => console.log(err));
});

// @route   PATCH /contact
// @desc    Update user contact information
// @access  Private
router.patch('/contact', passport.authenticate('jwt', { session: false }), (req, res) => {
  const current_user_id = req.user.id;
  let { phone, address, email } = req.body;
  User.findOne({ where: { id: current_user_id } }).then((user) => {
    if (!user) {
      return res.status(404).json({ status: 404, no_user: 'User does not exist' });
    }
    User.update(
      { phone, address, email },
      { where: { id: current_user_id }, returning: true },
    ).then((newUser) => {
      if (newUser[0] === 0) {
        return res.status(400).json({ status: 400, update_err: 'Unable to update user contact info.' });
      }
      res.status(200).json({ status: 200, update_contact: 'Contact info updated successfully' });
    });
  }).catch((err) => console.log(err));
});

module.exports = router;