import { login, logOut, updateSettings,checkOut } from './helpers';

// Login Form
const form = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logOutBtn) {
  logOutBtn.addEventListener('click', logOut);
}

// Settings form
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const photo = document.querySelector('#photo')
const saveForm = document.querySelector('.form-user-data');
if (saveForm){
  saveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData()
    form.append('name',name.value)
    form.append('email',email.value)
    form.append('photo',photo.files[0])
    updateSettings(form,'updateme');
  });
}

// password form
const passwordForm = document.querySelector('.form-user-settings');
const currentPassword = document.querySelector('#password-current');
const newPassword = document.querySelector('#password');
const confirmPassword = document.querySelector('#password-confirm');
if (passwordForm){
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateSettings({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    },'updatepassword');
  });
}

// booking
const bookTourButton=document.getElementById("bookTour")
if (bookTourButton) {
  bookTourButton.addEventListener('click',()=>{
    bookTourButton.textContent="Processing..."
    checkOut(bookTourButton.dataset.tourid)
  })
}