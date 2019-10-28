/* eslint-disable no-restricted-globals */
/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');

const data = multer();

const Order = require('../../../models/Order');
const Car = require('../../../models/Car');

const router = express.Router();

// @route   POST /order
// @desc    Create a purchase order
// @access  Private
router.post('/', data.none(), passport.authenticate('jwt', { session: false }), (req, res) => {
  let { amount } = req.body;
  const buyer_id = req.user.id;
  const buyer_email = req.user.email;
  const { car_id } = req.query;
  if (!amount) {
    return res.status(400).json({ status: 400, error: 'Please enter offer amount' });
  }
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    res.status(404).json({ status: 404, error: 'Invalid car Id' });
  }
  Car.findById(car_id).then((car) => {
    if (!car) {
      return res.status(404).json({ status: 404, error: 'Car does not exist' });
    }
    const newOrder = new Order({ buyer_id, buyer_email, amount, car_id });
    newOrder.save().then((order) => res.status(200).json({
      status: 200,
      message: 'Your order have been sent',
      details: {
        order_id: order.id,
        amount,
        order_status: order.status,
      },
    })).catch(() => res.status(400).json({ status: 400, error: 'Unable to place an order at the moment' }));
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

// @route   POST /:order_id/status/accepted
// @desc    Mark an offer as accepted
// @access  Private
router.patch('/:order_id/status', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { order_id } = req.params;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(order_id)) {
    return res.status(404).json({ status: 404, error: 'Order Id is invalid' });
  }
  Order.findById(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, error: 'Order not found' });
    }
    if (current_user_id === order.buyer_id && order.status === 'pending') {
      Order.updateOne(
        { _id: order_id },
        { $set: { status: 'accepted' } },
      ).then(() => res.status(200).json({
        status: 200,
        message: 'Order have been accepted',
      })).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
    } else {
      res.status(401).json({ status: 401, error: 'Not Allowed' });
    }
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

// @route   PATCH /:order_id/price
// @desc    Update a purchase order amount
// @access  Private
router.patch('/:order_id/amount', data.none(), passport.authenticate('jwt', { session: false }), (req, res) => {
  const { order_id } = req.params;
  const current_user_id = req.user.id;
  let { new_amount } = req.body;
  new_amount = parseFloat(new_amount);
  if (!mongoose.Types.ObjectId.isValid(order_id)) {
    return res.status(404).json({ status: 404, error: 'Order Id is invalid' });
  }
  Order.findById(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, error: 'Order not found' });
    }
    if (order.status === 'accepted') {
      return res.status(401).json({ status: 401, error: 'Offer already accepted, cannot update amount' });
    }
    if (current_user_id === order.buyer_id && order.status === 'pending') {
      Order.updateOne(
        { _id: order_id },
        { $set: { amount: new_amount } },
      ).then(() => res.status(200).json({
        status: 200,
        message: 'Order amount have been updated',
      })).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
    } else {
      res.status(401).json({ status: 401, error: 'Not Allowed' });
    }
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

// @route   GET /user
// @desc    View all purchase orders by a user
// @access  Private
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  const current_user_id = req.user.id;
  Order.find({ buyer_id: current_user_id }).then((orders) => {
    if (orders.length > 0) {
      return res.status(200).json(
        {
          status: 200,
          user_orders: orders,
        },
      );
    }
    res.status(404).json({ status: 404, error: 'You do not have any orders' });
  });
});

// @route   GET /car/:car_id
// @desc    View all pending purchase offers for a specific car
// @access  Public
router.get('/car/:car_id', (req, res) => {
  const { car_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(car_id)) {
    return res.status(404).json({ status: 404, error: 'Car Id is invalid' });
  }
  Car.findById(car_id).then((car) => {
    if (!car) {
      return res.status(404).json({ status: 404, error: 'Car does not exist' });
    }
    Order.find({ car_id, status: 'pending' }).then((orders) => {
      if (orders.length > 0) {
        return res.status(200).json(
          {
            status: 200,
            car_orders: orders,
          },
        );
      }
      res.status(404).json({ status: 404, error: 'This car does not have any pending orders' });
    }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

// @route   DELETE /:order_id
// @desc    Deletes a pending order
// @access  Private
router.delete('/:order_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { order_id } = req.params;
  const current_user_id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(order_id)) {
    res.status(404).json({ status: 404, error: 'Invalid order Id' });
  }
  Order.findById(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, error: 'Order does not exist' });
    }
    if (current_user_id === order.buyer_id && order.status === 'pending') {
      Order.deleteOne({ _id: order_id }).then(() => {
        res.status(200).json({
          status: 200,
          message: 'Order deleted successfuly',
        });
      }).catch(() => res.status(400).json({ status: 400, error: 'Unable to delete order' }));
    } else {
      res.status(401).json({ status: 401, error: 'You are not allowed to delete this order' });
    }
  }).catch(() => res.status(400).json({ status: 400, error: 'An error occured' }));
});

module.exports = router;