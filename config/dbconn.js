/* eslint-disable comma-dangle */
const Sequelize = require('sequelize');

const db = new Sequelize('postgres://bpdgttdbjzekmg:707dba2c9618a50059cf03f9a3cb13a28c87265af7ed7653cf383fd5ae9f33f8@ec2-54-243-253-181.compute-1.amazonaws.com:5432/d8r8lp3379drui');


db.authenticate()
  .then(() => console.log('Connected to database'))
  .catch((err) => console.log(`Error connecting to database : ${err}`));

module.exports = db;