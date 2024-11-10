const tokens: Set<string> = new Set();

export const addToken = (token: string): void => {
  tokens.add(token);
};

export const removeToken = (token: string): void => {
  tokens.delete(token);
};

export const isTokenValid = (token: string): boolean => {
  return tokens.has(token);
};