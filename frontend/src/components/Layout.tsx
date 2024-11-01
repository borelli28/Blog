import React from 'react';
import Navbar from './Navbar';
import '../styles/Home.css';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated }) => (
  <div>
    <Navbar isAuthenticated={isAuthenticated} />
    <main>{children}</main>
  </div>
);

export default Layout;