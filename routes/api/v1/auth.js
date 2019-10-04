/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../../models/User');
const upload = require('../../../config/useruploads');
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
      return res.status(400).json({ status: 400, email_exist: 'Email already exist, please login' });
    }
    if (!firstName || !lastName || !username || !phone || !address
      || !email || !password || !confirmPass) {
      return res.status(400).json({ status: 400, empty_fields: 'Please fill all fields' });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 400, password_len: 'Password must be more than 8 characters' });
    }
    if (password !== confirmPass) {
      return res.status(400).json({ status: 400, password_match: 'Passwords do not match' });
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
          registeredUser: user,
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
    return res.status(400).json({ status: 400, email_pass: 'Please enter a valid email and password' });
  }
  User.findOne({ where: { email } }).then((user) => {
    if (!user) {
      return res.status(404).json({ status: 404, err_email: 'Email does not exist' });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = { id: user.id, lastName: user.lastName, profilePic: user.profilePic };
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 21600000 }, (err, token) => {
          res.status(200).json({
            status: 200,
            token: `Bearer ${token}`,
            user,
          });
        });
      } else {
        return res.status(400).json({ status: 400, err_pass: 'Password incorrect' });
      }
    });
  });
});

// @route   DELETE api/v1/auth/delete_user/user_id
// @desc    Deletes a user account
// @access  Private
router.delete('/delete_user/:user_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  if (user_id < 1) {
    res.status(400).json({ status: 400, user_id_err: 'Invalid user Id' });
  }
  if (Number.isNaN(user_id)) {
    res.status(404).json({ status: 404, invalid_user_id: 'user not found, user id must be a positive number' });
  }
  User.findByPk(user_id).then((user) => {
    if (!user) {
      res.status(404).json({ status: 404, user_err: 'User not found' });
    }
    User.destroy({ where: { id: user_id } }).then((rowDeleted) => {
      if (rowDeleted !== 1) {
        res.status(400).json({ status: 400, user_delete_err: 'Unable to delete user' });
      }
      res.status(200).json(
        {
          status: 200,
          delete_success: 'User deleted successfully',
          deleted_user: user,
        },
      );
    });
  }).catch((err) => console.log(err));
});


module.exports = router;