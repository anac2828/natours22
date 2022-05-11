import 'babel-polyfill';
import { login, logout, signup } from './login.js';
import { forgotPassword, resetPassword } from './resetPassword.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { showAlert } from './showAlerts.js';

// ******* DOM ELEMENTS
const mapBoxContainer = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const forgotPasswordForm = document.querySelector('#forgot-password');
const resetPasswordForm = document.querySelector('#reset-password');
const updatePasswordForm = document.querySelector('.form-user-settings');
const userDataForm = document.querySelector('.form-user-data');
const bookBtn = document.querySelector('#book-tour');

// ******* VALUES

// ********** DELEGATION

//DISPLAY MAP IN TOUR DETAILS PAGE

if (mapBoxContainer) {
  const locations = JSON.parse(mapBoxContainer.dataset.locations);
  displayMap(locations);
}

// FORGOT PASSWORD FORM
if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#email').value;

    forgotPassword(email);
  });

// RESET PASSWORD FORM
if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;
    const resetToken = resetPasswordForm.dataset.resettoken;
    resetPassword(password, passwordConfirm, resetToken);
  });

// SING UP FORM

if (signupForm)
  signupForm.addEventListener('submit', (event) => {
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#passwordConfirm').value;
    event.preventDefault();
    signup(name, email, password, passwordConfirm);
  });

// LOGIN FORM

if (loginForm)
  loginForm.addEventListener('submit', (event) => {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    event.preventDefault();
    login(email, password);
  });

// LOGOUT

if (logoutBtn) logoutBtn.addEventListener('click', logout);

// ********************************
// UPDATE USER DATA

if (userDataForm) {
  userDataForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // this will create an enctype="multipart/form-data"  form data

    //form will be an object
    const form = new FormData();
    // key, value
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    // files are an array
    form.append('photo', document.querySelector('#photo').files[0]);

    // const name = document.querySelector('#name').value;
    // const email = document.querySelector('#email').value;

    updateSettings(form, 'data');
  });
}

// UPDATE PASSWORD

if (updatePasswordForm)
  updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentPassword = document.querySelector('#password-current');
    const newPassword = document.querySelector('#password');
    const confirmPassword = document.querySelector('#password-confirm');

    await updateSettings(
      {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      },
      'password'
    );

    currentPassword.value = newPassword.value = confirmPassword.value = '';
  });

// TOUR BOOKING

if (bookBtn) {
  bookBtn.addEventListener('click', (event) => {
    event.target.textContent = 'Processing...';
    const { tourId } = event.target.dataset;
    bookTour(tourId);
  });
}

// STRIPE MESSAGE workaround
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);