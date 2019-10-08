/* eslint-disable comma-dangle */
const Sequelize = require('sequelize');

const db = new Sequelize('d4452ahhqtjnn6', 'osktwclscsinxn', '0394f4781f07ab3b22f2332a091f2a7de712e90a3d6324cd76bc24248f651881', {
  host: 'ec2-174-129-227-128.compute-1.amazonaws.com',
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

db.authenticate()
  .then(() => console.log('Connected to heroku database...'))
  .catch((err) => console.log(`Error connecting to database : ${err}`));

module.exports = db;
