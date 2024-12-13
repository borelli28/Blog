import { useEffect, useRef } from 'react';
import { refreshToken } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const useTokenRefresh = () => {
  const refreshIntervalId = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshTokenPeriodically = async () => {
      try {
        await refreshToken();
      } catch (error) {
        navigate('/login');
      }
    };

    // Refresh token every 45 minutes
    refreshIntervalId.current = setInterval(refreshTokenPeriodically, 45 * 60 * 1000);

    // Clean up interval on component unmount
    return () => {
      if (refreshIntervalId.current) {
        clearInterval(refreshIntervalId.current);
      }
    };
  }, [navigate]);
};

export default useTokenRefresh;