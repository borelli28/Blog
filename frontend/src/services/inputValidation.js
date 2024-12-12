export const sanitizeUsername = (username) => {
  // Allow only alphanumeric characters and underscores
  return username.replace(/[^a-zA-Z0-9_]/g, '');
};

export const validateUsername = (username) => {
  if (username.length < 3) {
    return "Username should be at least 3 characters long";
  }
  if (username.length > 30) {
    return "Username cannot be longer than 30 characters";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return null;
};

export const validatePassword = (password) => {
  if (password.length < 11) {
    return "Password should be at least 11 characters";
  }
  if (password.length > 72) {
    return "Password cannot be longer than 72 characters";
  }
  return null;
};