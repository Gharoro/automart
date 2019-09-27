/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const upload = require('../../../config/uploads');
const keys = require('../../../config/keys');

const router = express.Router();

// @route   POST api/v1/auth/signup
// @desc    Create user account
// @access  Public
router.post('/signup', upload.single('profilePic'), (req, res) => {
  let { firstName, lastName, username, phone, address, email, password, confirmPass } = req.body;
  let profilePic = req.file;
  User.findOne({ where: { email } }).then((user) => {
    if (user) {
      return res.status(400).json({ email_exist: 'Email already exist' });
    }
    if (!firstName || !lastName || !username || !phone || !address
      || !email || !password || !confirmPass) {
      return res.status(400).json({ empty_fields: 'Please fill all fields' });
    }
    if (password.length < 8) {
      return res.status(400).json({ password_len: 'Password must be more than 8 characters' });
    }
    if (password !== confirmPass) {
      return res.status(400).json({ password_match: 'Passwords do not match' });
    }
    if (!profilePic) {
      let avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      profilePic = avatar;
    } else {
      profilePic = profilePic.path;
    }
    if (profilePic.size > 2000000) {
      return res.status(400).json({ status: 400, picSizeError: 'Please upload a picture less than 2mb' });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        password = hash;
        User.create({
          firstName, lastName, username, profilePic, phone, address, email, password,
        }).then((user) => res.status(200).json({
          status: 200,
          data: user,
        })).catch((err) => res.status(400).json({
          status: 400,
          error: err,
        }));
      });
    });
  });
});

// @route   POST api/auth/signin
// @desc    Login a user / Returning JWT Token
// @access  Public
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ email_pass: 'Please enter a valid email and password' });
  }
  User.findOne({ where: { email } }).then((user) => {
    if (!user) {
      return res.status(404).json({ err_email: 'Email does not exist' });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = { id: user.id, lastName: user.lastName, profilePic: user.profilePic };
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: `Bearer ${token}`,
          });
        });
      } else {
        return res.status(400).json({ err_pass: 'Password incorrect' });
      }
    });
  });
});

// @route   POST api/auth/signout
// @desc    Logout a user
// @access  Private
router.post('/signout', (req, res) => res.json({ msg: 'user logged out' }));

// @route   DELETE api/auth/delete-account
// @desc    Deletes a user account
// @access  Private
router.post('/delete-account', (req, res) => res.json({ msg: 'user account deleted' }));


module.exports = router;