// For importing user image photo
import multer from 'multer';

// ********* MULTER CONFIG ************

// // will store the file as an image not a string
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     // callback first argument is an error or null if no error. Second arg is the file path where image will be saved.
//     callback(null, 'public/img/users');
//   },
//   filename: (req, file, callback) => {
//     // file comes from the req.file when the upload middleware is used.
//     const ext = file.mimetype.split('/')[1];
//     // callback first argument is an error or null if no error. Second arg is the file name that will be given to the image.
//     callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// Image will be store as a buffer so we can use sharp to resize image
const multerStorage = multer.memoryStorage();

// If file is an image the callback will recive true if not false and will create an error
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) return callback(null, true);

  callback(
    new AppError('Not an image! Please upload only images.', 400),
    false
  );
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
