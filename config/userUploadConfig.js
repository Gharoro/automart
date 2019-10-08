/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

const secret = require('./secret');

cloudinary.config({
  cloud_name: secret.CLOUDINARY_CLOUD_NAME,
  api_key: secret.CLOUDINARY_API_KEY,
  api_secret: secret.CLOUDINARY_API_SECRET,
});
const storage = cloudinaryStorage({
  cloudinary,
  folder: 'automart_users',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
});
const parser = multer({ storage });


module.exports = parser;