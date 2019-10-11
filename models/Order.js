const Sequelize = require('sequelize');

const db = require('../config/dbconn');

const Order = db.define('order', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  buyer: {
    type: Sequelize.INTEGER,
    AllowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  car_id: {
    type: Sequelize.INTEGER,
    AllowNull: false,
    references: {
      model: 'cars',
      key: 'id',
    },
  },
  amount: {
    type: Sequelize.FLOAT,
    AllowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    AllowNull: false,
    defaultValue: 'pending',
  },
});

module.exports = Order;
