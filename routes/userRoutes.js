import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';
const router = express.Router();

// ********** ROUTES

// USER AUTH ROUTES
router.post('/signup', authController.signup);
// It is a post request because we are sending the token
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

// This will protect all routes below so that you don't have to put it on all routes
// Middleware
router.use(authController.protect);
//

router.patch('/updatepassword', authController.updatePassword);

// LOGGED IN USER ROUTES
router.get('/me', userController.getMe, userController.getUser);

router.patch('/updatemydata', userController.updateMe);
router.delete('/deletemyaccount', userController.deleteAccount);

// ROUTES FOR ADMIN
router.use(authController.restrictTo('admin'));

// - RESTFUL ROUTES
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
