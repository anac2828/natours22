import axios from 'axios';
import { showAlert } from './showAlerts';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/forgotpassword',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      window.setTimeout(() => location.reload(), 1500);
    }

    return res.data.resetToken;
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, resetToken) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/resetpassword/${resetToken}`,
      data: { password, passwordConfirm },
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      // window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
