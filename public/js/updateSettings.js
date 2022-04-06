import axios from 'axios';
import { showAlert } from './showAlerts';

// export const updateData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: '/api/v1/users/updatemydata',
//       data: { name, email },
//     });

//     if ((res.data.status = 'success'))
//       showAlert('success', 'Your data has been updated');
//   } catch (error) {
//     showAlert('error', error.response.data.message);
//   }
// };
// type is password of data
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updatepassword' : '/api/v1/users/updatemydata'
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if ((res.data.status = 'success'))
      showAlert('success', `Your ${type} has been updated`);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};