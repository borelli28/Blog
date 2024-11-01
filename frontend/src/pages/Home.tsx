import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface Blog {
  title: string;
  description: string;
}

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
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
    <Layout isAuthenticated={isAuthenticated}>
      <div id="intro">
        <h2>Welcome</h2>
        <p>Some description here...</p>
      </div>

      <div id="cards">
        {blogs.map((blog) => (
          <div className="row" key={blog.title}>
            <div className="card hoverable">
              <Link to={`/blog/${encodeURIComponent(blog.title)}`}>
                <div className="card-content grey darken-3">
                  <span className="card-title">{blog.title}</span>
                  <p>{blog.description}</p>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {isAuthenticated && (
        <div>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      )}
    </Layout>
  );
};

export default Home;