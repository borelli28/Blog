const checkAuth = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
  return false;
};

export const AuthService = {
  checkAuth,
};