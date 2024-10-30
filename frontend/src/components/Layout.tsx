import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  username?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, username }) => (
  <div>
    <div id="top-section">
      <div id="logo">
        <h5>Home Page</h5>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/" className="btn light-blue">Home</Link>
          </li>
          <li>
            <Link to="/blogs" className="btn light-blue">Blogs</Link>
          </li>
          {username && (
            <li>
              <Link to="/admin" className="btn light-blue">Admin</Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
    <main>{children}</main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  </div>
);

export default Layout;