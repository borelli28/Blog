export const checkAuth = async () => {
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

export const refreshToken = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refreshToken`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};