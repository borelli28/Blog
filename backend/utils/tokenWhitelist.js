const tokens = new Map();

export const addToken = (token) => {
  const expirationTime = Date.now() + 3600000; // 1 hour from now
  tokens.set(token, expirationTime);
};

export const removeToken = (token) => {
  tokens.delete(token);
};

export const isTokenValid = (token) => {
  const expirationTime = tokens.get(token);
  if (!expirationTime) {
    return false; // Token not found in the whitelist
  }

  if (Date.now() > expirationTime) {
    tokens.delete(token); // Remove expired token
    return false;
  }

  return true;
};