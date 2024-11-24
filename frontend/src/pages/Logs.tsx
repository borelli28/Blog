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

  // const handleRemoveLog = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setErrors({});

  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ username, password, confirm_password: confirmPassword }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       navigate('/login');
  //     } else {
  //       if (data.errors) {
  //         setErrors(data.errors);
  //       } else {
  //         setErrors({ general: data.error || 'Registration failed' });
  //       }
  //     }
  //   } catch (error) {
  //     setErrors({ general: 'An error occurred. Please try again.' });
  //   }
  // };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container">
        <h1>Logs</h1>
        <table className="table table-bordered table-striped-columns table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">Level</th>
              <th scope="col">Message</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td >{log.timestamp}</td>
                <td>{log.level}</td>
                <td>{log.message}</td>
                <td>
                  <button className="btn btn-danger" onClick={ handleRemoveLog(log.index) }>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Logs;