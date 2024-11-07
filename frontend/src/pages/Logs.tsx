import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface Log {
  timestamp: string;
  level: string;
  message: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        } else {
          console.error('Failed to fetch logs');
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    fetchLogs();
    checkAuth();
  }, []);

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container">
        <h1>Logs</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.timestamp}</td>
                <td>{log.level}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Logs;