import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
    <div className="container-fluid">
      <div id="logo">
        <h5>Title Here</h5>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link btn btn-outline-primary mx-1">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/blogs" className="nav-link btn btn-outline-primary mx-1">Blogs</Link>
        </li>
        {isAuthenticated && (
          <>
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link btn btn-outline-primary mx-1">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/logs_page" className="nav-link btn btn-outline-primary mx-1">Logs</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  </nav>
);

export default Navbar;