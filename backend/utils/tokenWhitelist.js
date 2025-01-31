const tokens = new Map();

export const addToken = (token) => {
  const ONE_HOUR_IN_MS = 60 * 60 * 1000;
  const expirationTime = Date.now() + ONE_HOUR_IN_MS;
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

export const printWhitelist = () => {
  console.log('Current Whitelist:');
  tokens.forEach((expirationTime, token) => {
    const remainingTime = Math.max(0, expirationTime - Date.now());
    console.log(`Token: ${token.substring(0, 20)}... | Expires in: ${Math.floor(remainingTime / 1000)} seconds`);
  });
  console.log(`Total tokens: ${tokens.size}`);
};