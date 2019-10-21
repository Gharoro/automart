/* eslint-disable camelcase */
/* eslint-disable no-else-return */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
const express = require('express');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');

const auth = multer();
const User = require('../../../models/User');
const parser = require('../../../config/userUploadConfig');

const router = express.Router();

// @route   POST api/v1/auth/signup
// @desc    Create user account
// @access  Public
router.post('/signup', parser.single('profile_pic'), (req, res) => {
  let { first_name, last_name, phone, address, email, password, confirmPass } = req.body;
  let profile_pic = req.file;
  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({ status: 400, email_exist: 'Email already exist, please login' });
    }
    if (!first_name || !last_name || !phone || !address
      || !email || !password || !confirmPass) {
      return res.status(400).json({ status: 400, empty_fields: 'Please fill all fields' });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 400, password_length: 'Password must be more than 8 characters' });
    }
    if (password !== confirmPass) {
      return res.status(400).json({ status: 400, password_mis_match: 'Passwords do not match' });
    }
    if (!profile_pic) {
      return res.status(400).json({ status: 400, error: 'Please upload a picture' });
    }
    if (profile_pic.size > 2000000) {
      return res.status(400).json({ status: 400, picture_size: 'Please upload a picture less than 2mb' });
    }
    profile_pic = {
      public_ID: profile_pic.public_id,
      public_url: profile_pic.url,
    };
    const newUser = new User({
      first_name,
      last_name,
      phone,
      address,
      email,
      password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save()
          .then((user) => res.status(200).json({
            status: 200,
            new_user: user,
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
router.post('/signin', auth.none(), (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 400, error: 'Please enter a valid email and password' });
  }
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ status: 404, email_not_found: 'Email does not exist!' });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = { id: user.id, email: user.email, last_name: user.last_name };
        jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: 21600000 }, (err, token) => {
          res.status(200).json({
            status: 200,
            token: `Bearer ${token}`,
          });
        });
      } else {
        return res.status(400).json({ status: 400, password_error: 'Password incorrect!' });
      }
    });
  });
});

// @route   DELETE api/v1/auth/delete_user/user_id
// @desc    Deletes a user account
// @access  Private
router.delete('/delete_user/:user_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { user_id } = req.params;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(404).json({ status: 404, error: 'User Id does not exist' });
  }
  User.findById(user_id).then((user) => {
    const user_pic_id = user.profile_pic[0].public_ID;
    if (user_id.toString() !== current_user_id.toString()) {
      return res.status(401).json({ status: 401, error: 'Not authorised' });
    }
    User.deleteOne({ _id: user_id }).then(() => {
      cloudinary.v2.uploader.destroy(user_pic_id, () => {
        res.status(200).json({
          status: 200,
          message: 'User deleted',
        });
      });
    });
  }).catch((err) => res.status(400).json({ error: err }));
});


module.exports = router;