/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');
const sequelize = require('sequelize');

const { Op } = sequelize;
const Car = require('../../../models/Car');
const User = require('../../../models/User');
const upload = require('../../../config/caruploads');

const router = express.Router();

// @route   POST api/v1/car/
// @desc    Create a car sale ad
// @access  Private
router.post('/', upload.single('image'), passport.authenticate('jwt', { session: false }), (req, res) => {
  let { name, description, state, status, price, manufacturer, model, body_type } = req.body;
  state = state.toLowerCase();
  status = status.toLowerCase();
  manufacturer = manufacturer.toLowerCase();
  body_type = body_type.toLowerCase();
  let image = req.file;
  const owner = req.user.id;
  if (!name || !description || !state || !price || !manufacturer || !model || !body_type) {
    return res.status(400).json({ status: 400, empty_car_fields: 'Please fill all fields' });
  }
  if (!image) {
    return res.status(400).json({ status: 400, car_img: 'Please upload an image for your car' });
  }
  if (image.size > 5000000) {
    return res.status(400).json({ status: 400, car_size_error: 'Please upload a picture less than 5mb' });
  }
  image = image.path;
  Car.create({
    owner, name, description, state, status, price, manufacturer, model, body_type, image,
  }).then((car) => {
    res.status(200).json({
      status: 200,
      added_car: car,
    });
  }).catch((err) => res.status(400).json({
    status: 400,
    error: err,
  }));
});

// @route   PATCH api/v1/car/car_id/status
// @desc    Mark a posted car ad as sold(unavailable)
// @access  Private
router.patch('/:id/status', passport.authenticate('jwt', { session: false }), (req, res) => {
  const carId = parseInt(req.params.id, 10);
  const current_user_id = req.user.id;
  if (carId < 1) {
    res.status(400).json({ status: 400, car_id_err: 'Invalid car Id' });
  }
  if (Number.isNaN(carId)) {
    res.status(404).json({ status: 404, invalid_car_id: 'Car not found, car id must be a positive number' });
  }
  Car.findByPk(carId).then((car) => {
    if (!car) {
      res.status(404).json({ status: 404, no_car: 'Car does not exist' });
    }
    if (current_user_id === car.owner) {
      Car.update(
        { status: 'unavailable' },
        { where: { id: carId }, returning: true },
      ).then((newCar) => {
        if (newCar[0] === 0) {
          res.status(400).json({ status: 400, update_err: 'Unable to update car status.' });
        }
        const { status } = car;
        res.status(200).json({ status: 200, updated_car_status: status, newCar });
      });
    } else {
      res.status(401).json({ status: 401, error: 'You are not allowed to edit this car' });
    }
  }).catch((err) => console.log(err));
});

// @route   PATCH api/v1/car/car_id/price
// @desc    Update the price of a car
// @access  Private
router.patch('/:id/price', passport.authenticate('jwt', { session: false }), (req, res) => {
  const carId = parseInt(req.params.id, 10);
  const current_user_id = req.user.id;
  let { new_price } = req.body;
  if (carId < 1) {
    res.status(400).json({ status: 400, car_id_err: 'Invalid car Id' });
  }
  if (Number.isNaN(carId)) {
    res.status(404).json({ status: 404, invalid_car_id: 'Car not found, car id must be a positive number' });
  }
  Car.findByPk(carId).then((car) => {
    if (!car) {
      res.status(404).json({ status: 404, no_car: 'Car does not exist' });
    }
    if (current_user_id === car.owner) {
      Car.update(
        { price: new_price },
        { where: { id: carId }, returning: true },
      ).then((newCar) => {
        if (newCar[0] === 0) {
          res.status(400).json({ status: 400, update_err: 'Unable to update car price.' });
        }
        const { price } = car;
        res.status(200).json({ status: 200, updated_car_price: price, newCar });
      });
    } else {
      res.status(401).json({ status: 401, error: 'You are not allowed to edit this car' });
    }
  }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/car_id
// @desc    View a specific car
// @access  Public
router.get('/:car_id', (req, res) => {
  const car_id = parseInt(req.params.car_id, 10);
  if (car_id < 1) {
    res.status(400).json({ status: 400, car_id_err: 'Invalid car Id' });
  }
  if (Number.isNaN(car_id)) {
    res.status(404).json({ status: 404, invalid_car_id: 'Car not found, car id must be a positive number' });
  }
  Car.findByPk(car_id).then((car) => {
    if (!car) {
      res.status(404).json({ status: 404, car_err: 'Car not found' });
    }
    res.status(200).json({ status: 200, car });
  }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/status/available
// @desc    View all unsold cars
// @access  Public
router.get('/status/available', (req, res) => {
  Car.findAll({ where: { status: 'available' } })
    .then((cars) => {
      if (cars.length < 1) {
        res.status(404).json({ error: 'No available cars found' });
      }
      res.status(200).json({
        status: 200,
        found_cars: cars,
      });
    }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/state/new
// @desc    View all new unsold cars
// @access  Public
router.get('/state/new', (req, res) => {
  Car.findAll({ where: { state: 'new', status: 'available' } })
    .then((cars) => {
      if (cars.length < 1) {
        res.status(404).json({ error: 'No new cars found' });
      }
      res.status(200).json({
        status: 200,
        new_cars: cars,
      });
    }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/state/used
// @desc    View all used unsold cars
// @access  Public
router.get('/state/used', (req, res) => {
  Car.findAll({ where: { state: 'used', status: 'available' } })
    .then((cars) => {
      if (cars.length < 1) {
        res.status(404).json({ error: 'No used cars found' });
      }
      res.status(200).json({
        status: 200,
        used_cars: cars,
      });
    }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/search/q
// @desc    Search cars
// @access  Public
router.get('/search/q', (req, res) => {
  let { manufacturer, state, body_type, min_price, max_price } = req.query;
  manufacturer = (manufacturer === undefined) ? null : manufacturer.toLowerCase();
  state = (state === undefined) ? null : state.toLowerCase();
  body_type = (body_type === undefined) ? null : body_type.toLowerCase();
  min_price = (min_price === undefined) ? null : min_price;
  max_price = (max_price === undefined) ? null : max_price;
  Car.findAll({
    where: {
      status: 'available',
      [Op.or]: [
        { manufacturer },
        { state },
        { body_type },
        {
          price:
          {
            [Op.gte]: min_price,
            [Op.lte]: max_price,
          },
        },
      ],
    },
  }).then((cars) => {
    if (cars.length < 1) {
      res.status(404).json({ msg: 'No cars found' });
    }
    res.status(200).json({
      status: 200,
      found_cars: cars,
    });
  }).catch((err) => console.log(err));
});

// @route   DELETE api/v1/car/car_id
// @desc    Delete a specific car
// @access  Private
router.delete('/:car_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const car_id = parseInt(req.params.car_id, 10);
  const current_user_id = req.user.id;
  if (car_id < 1) {
    res.status(400).json({ status: 400, car_id_err: 'Invalid car Id' });
  }
  if (Number.isNaN(car_id)) {
    res.status(404).json({ status: 404, invalid_car_id: 'Car not found, car id must be a positive number' });
  }
  Car.findByPk(car_id).then((car) => {
    if (!car) {
      res.status(404).json({ status: 404, car_err: 'Car not found' });
    }
    if (current_user_id === car.owner) {
      Car.destroy({ where: { id: car_id } }).then((rowDeleted) => {
        if (rowDeleted !== 1) {
          res.status(400).json({ status: 400, delete_err: 'Unable to delete car' });
        }
        res.status(200).json(
          {
            status: 200,
            delete_success: 'Car deleted successfully',
            deleted_car: car,
          },
        );
      });
    } else {
      res.status(401).json({ status: 401, not_allowed: 'You are not authorized to delete this car' });
    }
  }).catch((err) => console.log(err));
});

// // @route   GET api/v1/car
// // @desc    View all posted car ads
// // @access  Public
router.get('/', (req, res) => {
  Car.findAll().then((cars) => {
    if (cars.length < 1) {
      res.status(404).json(
        {
          status: 404,
          car_msg: 'No cars found at the moment',
        },
      );
    }
    res.status(200).json({
      status: 200,
      all_cars: cars,
    });
  }).catch((err) => console.log(err));
});

// @route   GET api/v1/car/user/user_id
// @desc    View all posted car ads by a user
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const owner_id = parseInt(req.params.user_id, 10);
  if (owner_id < 1) {
    res.status(400).json({ status: 400, user_id_err: 'Invalid user Id' });
  }
  if (Number.isNaN(owner_id)) {
    res.status(404).json({ status: 404, invalid_user_id: 'User does not exist' });
  }
  Car.findAll({ where: { owner: owner_id } }).then((cars) => {
    User.findByPk(owner_id).then((user) => {
      if (cars.length > 0) {
        return res.status(200).json(
          {
            status: 200,
            seller_email: user.email,
            seller_ads: cars,
          },
        );
      }
      return res.status(404).json({ status: 404, no_user_ads: 'No ads found for this user' });
    });
  }).catch((err) => console.log(err));
});


module.exports = router;