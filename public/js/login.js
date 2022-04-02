import { showAlert } from './showAlerts';
import axios from 'axios';

// LOGIN REQUEST
export const login = async (email, password) => {
  try {
    // ********** FETCH
    // const res = await fetch('/api/v1/users/login', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email, password }),
    // });

    // The response will return a token and user info
    // const data = await res.json();
    // If user name or password is invalid
    // if (!res.ok) throw Error(data.message);

    // if (data.status === 'success') {
    //   showAlert('success', 'You are now logged in.');
    //   window.setTimeout(() => location.assign('/'), 1500);
    // }

    // AXIOS AJAX
    const data = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: { email, password },
    });

    if (data.data.status === 'success') {
      showAlert('success', 'You are now logged in.');
      window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (error) {
    //FETCH
    // showAlert('error', error.message);
    //AXIOS
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
      headers: { 'Content-Type': 'applicatoin/json' },
    });
    const data = await res.json();

    // reload true to force a reload and clear browser cache
    if (data.status === 'success') location.assign('/login');
  } catch (error) {
    showAlert('error', 'Error loggin out! Try again.');
  }
};
