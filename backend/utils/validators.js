import { db } from '../models/db';

// Only alphanumeric characters and underscores allowed
const containsDangerousChars = (str) => {
  const dangerousChars = /[<>(){}[\]'"`;&]/;
  return dangerousChars.test(str);
};

export const userRegisterValidator = (postData) => {
  const errors = {};

  if (postData.username.length < 3) {
    errors.username = "Username should be at least 3 characters long";
  } else if (postData.username !== "admin") {
    errors.username = "Username is not valid";
  } else if (postData.username.length > 30) {
    errors.username = "Username cannot be longer than 30 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(postData.username)) {
    errors.username = "Username can only contain letters, numbers, and underscores";
  }

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  } else if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  }

  if (postData.password !== postData.confirmPassword) {
    errors.password = "Passwords do not match";
  }

  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [postData.username], (err, row) => {
      if (row) {
        errors.username = "Username is not valid";
      }
      resolve(errors);
    });
  });
};

export const userLoginValidator = (postData) => {
  const errors = {};

  if (postData.username.length < 3) {
    errors.username = "Username should be at least 3 characters long";
  } else if (postData.username.length > 30) {
    errors.username = "Username cannot be longer than 30 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(postData.username)) {
    errors.username = "Username can only contain letters, numbers, and underscores";
  }

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  } else if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  }

  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [postData.username], (err, row) => {
      if (!row) {
        errors.username = "Invalid username or password";
      }
      resolve(errors);
    });
  });
};

export const passwordValidator = (postData) => {
  const errors = {};

  if (postData.password.length < 11) {
    errors.password = "Password should be at least 11 characters";
  } else if (postData.password.length > 72) {
    errors.password = "Password cannot be longer than 72 characters";
  } else if (containsDangerousChars(postData.password)) {
    errors.password = "Password contains invalid characters";
  }

  return errors;
};