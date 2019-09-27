/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
const multer = require('multer');
const path = require('path');

// Multer Set Storage
const appDir = path.dirname(require.main.filename);
const uploadLocation = path.join(appDir, '/uploads/users');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadLocation);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File validation
function validateFile(file, cb) {
  // Define the allowed extension
  let fileExts = ['jpg', 'jpeg', 'png'];
  // Check allowed extensions
  let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
  // Mime type must be an image
  let isImage = file.mimetype.startsWith('image/');
  if (isAllowedExt && isImage) {
    return cb(null, true); // no errors
  } else {
    cb('ImageError: File type not allowed!');
  }
}

const upload = multer(
  {
    storage,
    fileFilter: function fileFilter(req, file, cb) {
      validateFile(file, cb);
    },
  },
);

module.exports = upload;