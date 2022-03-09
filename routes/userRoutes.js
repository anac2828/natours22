import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
const router = express.Router();

// ********** ROUTES

// AUTH ROUTES
router.post('/signup', authController.signup);
// It is a post request because we are sending the token
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);

// LOGGED IN USER ROUTES

router.patch('/updatemydata', authController.protect, userController.updateMe);

// - RESTFUL ROUTES
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
