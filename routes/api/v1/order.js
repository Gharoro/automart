/* eslint-disable no-restricted-globals */
/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const express = require('express');
const passport = require('passport');

const Order = require('../../../models/Order');

const router = express.Router();

// @route   POST /order
// @desc    Create a purchase order
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  let { amount, status } = req.body;
  amount = parseFloat(amount);
  const buyer = req.user.id;
  const { car_id } = req.query;
  if (!amount) {
    return res.status(400).json({ status: 400, no_amount: 'Please enter offer amount' });
  }
  if (isNaN(amount)) {
    return res.status(400).json({ status: 400, invalid_amount: 'Please enter a valid amount' });
  }
  Order.create({ buyer, car_id, amount, status }).then((order) => {
    if (order) {
      return res.status(200).json(
        {
          status: 200,
          success: 'Your offer have been sent successfully',
        },
      );
    }
    res.status(400).json({ status: 400, failed_order: 'Your could not be placed' });
  });
});

// @route   POST /:order_id/status/accepted
// @desc    Mark an offer as accepted
// @access  Private
router.patch('/:order_id/status', passport.authenticate('jwt', { session: false }), (req, res) => {
  const order_id = parseInt(req.params.order_id, 10);
  if (order_id < 1) {
    return res.status(400).json({ status: 400, order_id_err: 'Invalid order Id' });
  }
  if (Number.isNaN(order_id)) {
    return res.status(404).json({ status: 404, invalid_order_id: 'Please enter a valid order id' });
  }
  Order.findByPk(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, no_order: 'order does not exist' });
    }
    Order.update(
      { status: 'accepted' },
      { where: { id: order_id }, returning: true },
    ).then((newOrder) => {
      if (newOrder[0] === 0) {
        return res.status(400).json({ status: 400, update_error: 'Unable to update Order status.' });
      }
      res.status(200).json({ status: 200, updated_order: newOrder });
    });
  });
});

// @route   PATCH /:order_id/price
// @desc    Update a purchase order price
// @access  Private
router.patch('/:order_id/price', passport.authenticate('jwt', { session: false }), (req, res) => {
  const order_id = parseInt(req.params.order_id, 10);
  const current_user_id = req.user.id;
  let { new_amount } = req.body;
  if (order_id < 1) {
    return res.status(404).json({ status: 404, order_id_err: 'Invalid order Id' });
  }
  if (Number.isNaN(order_id)) {
    return res.status(404).json({ status: 404, invalid_order_id: 'Please enter a valid order id' });
  }
  Order.findByPk(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, no_order: 'order does not exist' });
    }
    if (order.status === 'accepted') {
      return res.status(401).json({ status: 401, info: 'Offer already accepted, cannot update amount' });
    }
    if (order.status === 'pending' && order.buyer === current_user_id) {
      Order.update(
        { amount: new_amount },
        { where: { id: order_id }, returning: true },
      ).then((newOrder) => {
        if (newOrder[0] === 0) {
          return res.status(400).json({ status: 400, update_err: 'Unable to update Order amount.' });
        }
        res.status(200).json({ status: 200, updated_order: newOrder });
      });
    }
  });
});

// @route   GET /user
// @desc    View all purchase orders by a user
// @access  Private
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  const current_user_id = req.user.id;
  Order.findAll({ where: { buyer: current_user_id } }).then((orders) => {
    if (orders.length > 0) {
      return res.status(200).json(
        {
          status: 200,
          user_orders: orders,
        },
      );
    }
    res.status(404).json({ status: 404, no_user_orders: 'You do not have any orders' });
  });
});

// @route   GET /car/:car_id
// @desc    View all pending purchase offers for a specific car
// @access  Public
router.get('/car/:car_id', (req, res) => {
  const car_id = parseInt(req.params.car_id, 10);
  if (car_id < 1) {
    return res.status(400).json({ status: 400, car_id_err: 'Invalid car Id' });
  }
  if (Number.isNaN(car_id)) {
    return res.status(404).json({ status: 404, invalid_car_id: 'Car not found, car id must be a positive number' });
  }
  Order.findAll({ where: { car_id, status: 'pending' } }).then((orders) => {
    if (orders.length > 0) {
      return res.status(200).json(
        {
          status: 200,
          car_orders: orders,
        },
      );
    }
    res.status(404).json({ status: 404, no_car_orders: 'This car does not have any orders' });
  }).catch((err) => console.log(err));
});


// @route   DELETE /:order_id
// @desc    Mark an offer as rejected
// @access  Private
router.delete('/:order_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const order_id = parseInt(req.params.order_id, 10);
  if (order_id < 1) {
    return res.status(400).json({ status: 400, order_id_err: 'Invalid order Id' });
  }
  if (Number.isNaN(order_id)) {
    return res.status(404).json({ status: 404, invalid_order_id: 'Please enter a valid order id' });
  }
  Order.findByPk(order_id).then((order) => {
    if (!order) {
      return res.status(404).json({ status: 404, no_order: 'order does not exist' });
    }
    Order.destroy({ where: { id: order_id } }).then((rowDeleted) => {
      if (rowDeleted !== 1) {
        return res.status(400).json({ status: 400, order_delete_err: 'Unable to delete order' });
      }
      res.status(200).json(
        {
          status: 200,
          reject_msg: 'Order rejected',
          rejected_order: order,
        },
      );
    });
  }).catch((err) => console.log(err));
});

module.exports = router;