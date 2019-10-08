/* eslint-disable comma-dangle */
const Sequelize = require('sequelize');

const db = new Sequelize('postgres://osktwclscsinxn:0394f4781f07ab3b22f2332a091f2a7de712e90a3d6324cd76bc24248f651881@ec2-174-129-227-128.compute-1.amazonaws.com:5432/d4452ahhqtjnn6');

db.authenticate()
  .then(() => console.log('Connected to heroku database...'))
  .catch((err) => console.log(`Error connecting to database : ${err}`));

module.exports = db;
