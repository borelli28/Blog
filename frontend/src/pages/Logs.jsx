import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchLogs();
    checkAuth();
  }, []);

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

  const handleRemoveLog = async (timestamp) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/logs/${encodeURIComponent(timestamp)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setLogs(prevLogs => prevLogs.filter(log => log.timestamp !== timestamp));
        setAlert({ show: true, message: 'Log successfully removed!', type: 'success' });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } else {
        setAlert({ show: true, message: 'Failed to remove log', type: 'danger' });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Error removing log:', error);
      setAlert({ show: true, message: 'Error removing log', type: 'danger' });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container">
        <h1>Logs</h1>
        {alert.show && (
          <div className={`alert alert-${alert.type}`} role="alert">
            {alert.message}
          </div>
        )}
        <table className="table table-bordered table-striped-columns table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">Level</th>
              <th scope="col">Event Name</th>
              <th scope="col">Signature ID</th>
              <th scope="col">Severity</th>
              <th scope="col">Details</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.timestamp}</td>
                <td>{log.level}</td>
                <td>{log.name}</td>
                <td>{log.signatureId}</td>
                <td>{log.severity}</td>
                <td>
                  {Object.entries(log)
                    .filter(([key]) => !['timestamp', 'level', 'name', 'signatureId', 'severity', 'rt'].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleRemoveLog(log.timestamp)}>Remove</button>
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