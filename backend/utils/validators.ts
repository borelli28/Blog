import { db } from '../models/db';

export const userRegisterValidator = (postData: any) => {
  const errors: { [key: string]: string } = {};

  if (postData.username.length < 3) {
    errors.username = "Username should be at least 3 characters long";
  }

  if (postData.username.length > 30) {
    errors.username = "Username cannot be longer than 30 characters";
  }

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  }

  if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  }

  if (postData.password !== postData.confirm_password) {
    errors.password = "Password do not match";
  }

  if (postData.username !== 'admin') {
    errors.username = "Username is not valid. Please enter a valid username";
  }

  // Check if user already exists
  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [postData.username], (err, row) => {
      if (row) {
        errors.username = "Username is not valid. Please enter a valid username";
      }
      resolve(errors);
    });
  });
};

export const userLoginValidator = (postData: any) => {
  const errors: { [key: string]: string } = {};

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  }

  if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  }

  if (postData.username.length < 3) {
    errors.username = "Username should be at least 3 characters long";
  }

  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [postData.username], (err, row) => {
      if (!row) {
        errors.username = "You entered the wrong username or password. Try again";
      }
      resolve(errors);
    });
  });
};

export const passwordValidator = (postData: any) => {
  const errors: { [key: string]: string } = {};

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  }

  if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  }

  return errors;
};