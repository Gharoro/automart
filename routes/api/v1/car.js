/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const multer = require('multer');

const data = multer();
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
    return res.status(400).json({ status: 400, error: 'Please fill all fields' });
  }
  if (!image) {
    return res.status(400).json({ status: 400, error: 'Please upload an image for your car' });
  }
  if (image.size > 5000000) {
    return res.status(400).json({ status: 400, error: 'Please upload a picture less than 5mb' });
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
    message: 'Car listed',
    car,
  })).catch(() => res.status(400).json({
    status: 400,
    error: 'Unable to add car',
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
      })).catch(() => res.status(400).json({ status: 400, error: 'Unable to update car status' }));
    }
  }).catch(() => res.status(400).json({ status: 400, error: 'Unable to process request' }));
});

// @route   PATCH /:car_id/price
// @desc    Update the price of a car
// @access  Private
router.patch('/:id/price', data.none(), passport.authenticate('jwt', { session: false }), (req, res) => {
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
    })).catch(() => res.status(400).json({ status: 400, error: 'Unable to update car price' }));
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
    }).catch(() => res.status(400).json({ status: 400, error: 'Cannot fetch car at the moment' }));
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
    }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
    }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
    }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
  }).catch(() => res.status(400).json({ error: 'An error occured' }));
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
      return res.status(404).json({ status: 404, error: 'Car not found' });
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
      res.status(401).json({ status: 401, error: 'You are not authorized to delete this car' });
    }
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

// // @route   GET /car
// // @desc    View all posted car ads
// // @access  Public
router.get('/', (req, res) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  const query = {};
  if (page < 0 || page === 0) {
    return res.status(400).json({ status: 400, error: 'Invalid page number' });
  }
  if (limit > 6) {
    return res.status(400).json({ status: 400, error: 'Maximum result limit is 6' });
  }
  page = (!page) ? 1 : page;
  limit = (!limit) ? 3 : limit;
  query.skip = limit * (page - 1);
  query.limit = limit;
  query.end = page * limit;
  query.sort = { date: -1 };
  Car.countDocuments({}, (err, totalCount) => {
    if (err) {
      return res.status(400).json({ status: 400, error: 'An unexpected error occured' });
    }
    const totalPages = Math.ceil(totalCount / limit);
    Car.find().then((cars) => {
      const paginate_links = {};
      if (query.end < cars.length) {
        paginate_links.next = {
          page: page + 1,
          limit,
        };
      }
      if (query.skip > 0) {
        paginate_links.prev = {
          page: page - 1,
          limit,
        };
      }
      if (cars.length > 0) {
        return res.status(200).json({
          status: 200,
          pagination: {
            result: cars.length,
            page_num: page,
            total_pages: totalPages,
          },
          paginate_links,
          cars,
        });
      }
      res.status(404).json({ status: 404, error: 'There are currently no ads.' });
    }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
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
  }).catch(() => res.status(404).json({ status: 404, error: 'An error occured' }));
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
  }).catch(() => res.status(404).json({ status: 404, error: 'An error occured' }));
});

module.exports = router;