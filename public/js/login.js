const form = document.querySelector('.form');

// LOGIN REQUEST
const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    //The response will return a token and user info
    const data = await res.json();

    // const res = await axios({
    //   method: 'POST',
    //   url: 'http://localhost:3000/api/v1/users/login',
    //   data: { email, password },
    // });

    return data;
  } catch (error) {
    console.log(error);
  }
};

// LOGIN FORM

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  login(email, password);
});
