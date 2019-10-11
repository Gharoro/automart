const Sequelize = require('sequelize');

const db = require('../config/dbconn');

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  firstName: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  profilePic: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    AllowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    AllowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    AllowNull: false,
    validate: {
      len: { args: 8 },
    },
  },
  is_admin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = User;
