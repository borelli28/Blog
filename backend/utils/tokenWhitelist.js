const tokens = new Set();

export const addToken = (token) => {
  tokens.add(token);
};

export const removeToken = (token) => {
  tokens.delete(token);
};

export const isTokenValid = (token) => {
  return tokens.has(token);
};