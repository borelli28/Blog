import React from 'react';
import Navbar from './Navbar';
import '../styles/Home.css';

const Layout = ({ children, isAuthenticated }) => (
  <div>
    <Navbar isAuthenticated={isAuthenticated} />
    <main>{children}</main>
  </div>
);

export default Layout;