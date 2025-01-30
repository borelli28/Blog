import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Blogs.css';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/published`, {
        credentials: 'include',
      });
      const data = await response.json();
      setBlogs(data);
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

    fetchBlogs();
    checkAuth();
  }, []);

  return (
    <div id="blogs-container">
      <Navbar />
      {blogs.map((blog) => (
        <div className="row" key={blog.title}>
          <div className="card hoverable grey darken-3">
            <Link to={`/blog/${encodeURIComponent(blog.id)}`} className="card-content white-text">
              <span className="card-title">{blog.title}</span>
              <p className="card-description">{blog.description}</p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blogs;