import axios from 'axios';
import { showAlert } from './showAlerts';

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatemydata',
      data: { name, email },
    });

    if ((res.data.status = 'success'))
      showAlert('success', 'Your data has been updated');
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const updatePassword = async (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatepassword',
      data: { currentPassword, newPassword, confirmPassword },
    });

    if (res.data.status === 'success')
      showAlert('success', 'Your password has been updated');
  } catch (error) {
    showAlert('error', err.response.data.message);
  }
};
