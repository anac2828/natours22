import 'babel-polyfill';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';

// ******* DOM ELEMENTS
const mapBoxContainer = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updatePasswordForm = document.querySelector('.form-user-settings');
const userDataForm = document.querySelector('.form-user-data');

// ******* VALUES

// ********** DELEGATION

//DISPLAY MAP IN TOUR DETAILS PAGE

if (mapBoxContainer) {
  const locations = JSON.parse(mapBoxContainer.dataset.locations);
  displayMap(locations);
}
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

// UPDATE USER DATA

if (userDataForm) {
  userDataForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;

    updateSettings({ name, email }, 'data');
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
