/* eslint-disable comma-dangle */
const Sequelize = require('sequelize');

const db = new Sequelize('postgres://qcgkwojw:1L8eAm7NmZFOTte4EHbrF9bWh5ATn9mm@salt.db.elephantsql.com:5432/qcgkwojw');

db.authenticate()
  .then(() => console.log('Connected to remote database...'))
  .catch((err) => console.log(`Error connecting to database : ${err}`));

module.exports = db;
