const Sequelize = require('sequelize');

const db = require('../config/dbconn');

const Car = db.define('car', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  owner: {
    type: Sequelize.INTEGER,
    AllowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  state: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    AllowNull: false,
    defaultValue: 'available',
  },
  price: {
    type: Sequelize.FLOAT,
    AllowNull: false,
  },
  manufacturer: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  model: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  body_type: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  image: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
});

// Create table with car model
Car.sync({ alter: true })
  .then(() => console.log('Car table created'))
  .catch((err) => console.log(err));

module.exports = Car;
