import 'babel-polyfill';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';

// ******* DOM ELEMENTS
const loginForm = document.querySelector('#login-form');
const mapBoxContainer = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');

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