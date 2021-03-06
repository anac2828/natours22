export const hideAlert = () => {
  const alert = document.querySelector('.alert');
  // if there is an alert select the parent and remove the alert element (which is the child)
  if (alert) alert.parentElement.removeChild(alert);
};

export const showAlert = (type, msg, time = 7) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;

  // afterbegin will insert the markup at the top of the body tag
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};;
