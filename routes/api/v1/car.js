/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');

const Car = require('../../../models/Car');
const User = require('../../../models/User');
const parser = require('../../../config/carsUploadConfig');

const router = express.Router();

// @route   POST /car
// @desc    Create a car sale ad
// @access  Private
router.post('/', parser.single('image'), passport.authenticate('jwt', { session: false }), (req, res) => {
  let { name, description, state, status, price, manufacturer, model, body_type } = req.body;
  state = state.toLowerCase();
  status = status.toLowerCase();
  manufacturer = manufacturer.toLowerCase();
  body_type = body_type.toLowerCase();
  let image = req.file;
  const owner_id = req.user.id;
  if (!name || !description || !state || !price || !manufacturer || !model || !body_type) {
    return res.status(400).json({ status: 400, empty_car_fields: 'Please fill all fields' });
  }
  if (!image) {
    return res.status(400).json({ status: 400, no_img: 'Please upload an image for your car' });
  }
  if (image.size > 5000000) {
    return res.status(400).json({ status: 400, pic_size_error: 'Please upload a picture less than 5mb' });
  }
  image = {
    public_ID: image.public_id,
    public_url: image.url,
  };
  const newCar = new Car({
    owner_id, name, description, state, status, price, manufacturer, model, body_type, image,
  });
  newCar.save().then((car) => res.status(200).json({
    status: 200,
    new_car: car,
  })).catch((err) => res.status(400).json({
    status: 400,
    error: err,
  }));
});

// @route   PATCH /:car_id/status
// @desc    Mark a posted car ad as sold(unavailable)
// @access  Private
router.patch('/:id/status', passport.authenticate('jwt', { session: false }), (req, res) => {
  const car_id = req.params.id;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    return res.status(404).json({ status: 404, error: 'Car Id does not exist' });
  }
  Car.findById(car_id).then((car) => {
    if (!car) {
      return res.status(404).json({ status: 404, error: 'Car not found' });
    }
    if (current_user_id !== car.owner_id) {
      res.status(401).json({ status: 401, error: 'Not Authorised' });
    } else {
      Car.update(
        { _id: car_id },
        { $set: { status: 'unavailable' } },
      ).then(() => res.status(200).json({
        status: 200,
        message: 'Car updated successfuly',
      })).catch((err) => res.status(400).json({ status: 400, error: err }));
    }
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   PATCH /:car_id/price
// @desc    Update the price of a car
// @access  Private
router.patch('/:id/price', passport.authenticate('jwt', { session: false }), (req, res) => {
  const car_id = req.params.id;
  const current_user_id = req.user.id;
  let { new_price } = req.body;
  new_price = parseFloat(new_price);
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    return res.status(404).json({ status: 404, error: 'Car Id does not exist' });
  }
  Car.findById(car_id).then((car) => {
    if (!car) {
      return res.status(404).json({ status: 404, error: 'Car not found' });
    }
    if (current_user_id !== car.owner_id) {
      res.status(401).json({ status: 401, error: 'Not Authorised' });
    }
    Car.updateOne(
      { _id: car_id },
      { $set: { price: new_price } },
    ).then(() => res.status(200).json({
      status: 200,
      message: 'Car price updated successfuly',
    })).catch((err) => res.status(400).json({ status: 400, error: err }));
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /:car_id
// @desc    View a specific car
// @access  Public
router.get('/:car_id', (req, res) => {
  const { car_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    res.status(404).json({ status: 404, error: 'Invalid Car Id' });
  }
  Car.findById(car_id).then((car) => {
    const id = car.owner_id;
    User.findById(id).then((user) => {
      const seller_first_name = user.first_name;
      const seller_last_name = user.last_name;
      const member_since = user.joined;
      const pic_url = user.profile_pic[0].public_url;
      if (!car) {
        res.status(404).json({ status: 404, error: 'Car not found' });
      }
      res.status(200).json({
        status: 200,
        seller_first_name,
        seller_last_name,
        member_since,
        pic_url,
        car,
      });
    }).catch((err) => res.status(400).json({ status: 400, error: err }));
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /status/available
// @desc    View all unsold cars
// @access  Public
router.get('/status/available', (req, res) => {
  Car.find({ status: 'available' })
    .then((cars) => {
      if (cars.length < 1) {
        return res.status(404).json({ status: 404, error: 'No available cars found' });
      }
      res.status(200).json({
        status: 200,
        available_cars: cars,
      });
    }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /state/new
// @desc    View all new unsold cars
// @access  Public
router.get('/state/new', (req, res) => {
  Car.find({ state: 'new', status: 'available' })
    .then((cars) => {
      if (cars.length < 1) {
        return res.status(404).json({ status: 404, error: 'No new cars found' });
      }
      res.status(200).json({
        status: 200,
        new_cars: cars,
      });
    }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /state/used
// @desc    View all used unsold cars
// @access  Public
router.get('/state/used', (req, res) => {
  Car.find({ state: 'used', status: 'available' })
    .then((cars) => {
      if (cars.length < 1) {
        return res.status(404).json({ status: 404, error: 'No used cars found' });
      }
      res.status(200).json({
        status: 200,
        used_cars: cars,
      });
    }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /search/q
// @desc    Search cars
// @access  Public
router.get('/search/q', (req, res) => {
  let { manufacturer, state, body_type, min_price, max_price } = req.query;
  manufacturer = (manufacturer === undefined) ? '' : manufacturer.toLowerCase();
  state = (state === undefined) ? '' : state.toLowerCase();
  body_type = (body_type === undefined) ? '' : body_type.toLowerCase();
  min_price = (min_price === undefined) ? 0 : min_price;
  max_price = (max_price === undefined) ? 999999 : max_price;
  Car.find({
    status: 'available',
    manufacturer,
    state,
    $or: [{ body_type }, { price: { $gte: min_price, $lte: max_price } }],
  }).then((cars) => {
    if (cars.length < 1) {
      return res.status(404).json({ status: 404, error: 'No cars found' });
    }
    res.status(200).json({
      status: 200,
      result: cars,
    });
  }).catch((err) => res.status(400).json({ error: err }));
});

// @route   DELETE /:car_id
// @desc    Delete a specific car
// @access  Private
router.delete('/:car_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { car_id } = req.params;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    res.status(404).json({ status: 404, error: 'Invalid car Id' });
  }
  Car.findById(car_id).then((car) => {
    const car_img_id = car.image[0].public_ID;
    if (!car) {
      return res.status(404).json({ status: 404, no_car: 'Car not found' });
    }
    if (current_user_id === car.owner_id) {
      Car.deleteOne({ _id: car_id }).then(() => {
        cloudinary.v2.uploader.destroy(car_img_id, () => {
          res.status(200).json({
            status: 200,
            message: 'Car deleted successfuly',
          });
        });
      }).catch((err) => res.status(400).json({ status: 400, error: err }));
    } else {
      res.status(401).json({ status: 401, not_allowed: 'You are not authorized to delete this car' });
    }
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// // @route   GET /car
// // @desc    View all posted car ads
// // @access  Public
router.get('/', (req, res) => {
  Car.find().then((cars) => {
    if (cars.length > 0) {
      return res.status(200).json({
        status: 200,
        cars,
      });
    }
    res.status(404).json({ status: 404, error: 'There are currently no ads.' });
  }).catch((err) => res.status(400).json({ status: 400, error: err }));
});

// @route   GET /seller/:seller_id
// @desc    View all posted car ads by a seller
// @access  Public
router.get('/seller/:seller_id', (req, res) => {
  const { seller_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(seller_id)) {
    res.status(404).json({ status: 404, error: 'Invalid user Id' });
  }
  Car.find({ owner_id: seller_id }).then((cars) => {
    User.findById(seller_id).then((user) => {
      if (cars.length > 0) {
        return res.status(200).json(
          {
            status: 200,
            seller_email: user.email,
            seller_ads: cars,
          },
        );
      }
      res.status(404).json({ status: 404, error: 'No ads found for this user' });
    });
  }).catch((err) => res.status(404).json({ status: 404, error: err }));
});

// @route   GET /user/user_id
// @desc    View all posted car ads by a user
// @access  Private
router.get('/user/user_cars', passport.authenticate('jwt', { session: false }), (req, res) => {
  const current_user_id = req.user.id;
  Car.find({ owner_id: current_user_id }).then((cars) => {
    if (cars.length > 0) {
      return res.status(200).json(
        {
          status: 200,
          user_cars: cars,
        },
      );
    }
    res.status(404).json({ status: 404, error: 'You do not have any listed cars' });
  }).catch((err) => res.status(404).json({ status: 404, error: err }));
});

module.exports = router;