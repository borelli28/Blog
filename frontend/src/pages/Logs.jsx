import React, { useState, useEffect } from 'react';
import { getCSRFToken } from '../services/csrf';
import Layout from '../components/Layout';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('timestamp');
  const [filterValue, setFilterValue] = useState('');

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
        headers: {
          'X-CSRF-Token': getCSRFToken(),
        },
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

  const handleRemoveFiltered = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/logs/filtered`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          filter: selectedFilter,
          value: filterValue || '*'
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await fetchLogs(); // Refresh the logs
        setAlert({ show: true, message: 'Logs successfully removed!', type: 'success' });
        setFilterValue(''); // Reset filter value
        console.log(response);
      } else {
        setAlert({ show: true, message: 'Failed to remove logs', type: 'danger' });
      }
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error removing logs:', error);
      setAlert({ show: true, message: 'Error removing logs', type: 'danger' });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedLogs = React.useMemo(() => {
    let sortableLogs = [...logs];
    if (sortConfig.key !== null) {
      sortableLogs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLogs;
  }, [logs, sortConfig]);

  const filteredLogs = sortedLogs.filter(log => 
    Object.values(log).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container">
        <h1>Logs</h1>
        {alert.show && (
          <div className={`alert alert-${alert.type}`} role="alert">
            {alert.message}
          </div>
        )}
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control mb-3"
        />
        <form onSubmit={handleRemoveFiltered}>
          <div className="mb-3 d-flex gap-2">
            <select 
              className="form-select w-auto"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="timestamp">Timestamp</option>
              <option value="level">Level</option>
              <option value="signatureId">Signature ID</option>
              <option value="severity">Severity</option>
            </select>
            <input
              type="text"
              className="form-control w-auto"
              placeholder="Filter value (empty for all)"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Delete Filtered Logs</button>
          </div>
        </form>
        <table className="table table-bordered table-striped-columns table-hover">
          <thead className="table-light">
            <tr>
              <th 
                scope="col" 
                onClick={() => requestSort('timestamp')} 
                style={{ cursor: 'pointer' }}
              >
                Timestamp {sortConfig.key === 'timestamp' && (
                  <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                )}
              </th>
              <th 
                scope="col" 
                onClick={() => requestSort('level')} 
                style={{ cursor: 'pointer' }}
              >
                Level {sortConfig.key === 'level' && (
                  <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                )}
              </th>
              <th 
                scope="col" 
                onClick={() => requestSort('name')} 
                style={{ cursor: 'pointer' }}
              >
                Event Name {sortConfig.key === 'name' && (
                  <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                )}
              </th>
              <th 
                scope="col" 
                onClick={() => requestSort('signatureId')} 
                style={{ cursor: 'pointer' }}
              >
                Signature ID {sortConfig.key === 'signatureId' && (
                  <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                )}
              </th>
              <th 
                scope="col" 
                onClick={() => requestSort('severity')} 
                style={{ cursor: 'pointer' }}
              >
                Severity {sortConfig.key === 'severity' && (
                  <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                )}
              </th>
              <th scope="col">Details</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
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