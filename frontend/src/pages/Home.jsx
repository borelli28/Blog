import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/featured`, {
          credentials: 'include',
        });
        if (response.ok) {
          const fetchedBlogs = await response.json();
          setBlogs(fetchedBlogs);
        } else {
          setError('Failed to fetch blogs');
        }
      } catch (error) {
        setError('An error occurred while fetching blogs');
      } finally {
        setIsLoading(false);
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
        setIsAuthenticated(false);
      }
    };

    fetchBlogs();
    checkAuth();
  }, []);

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <main>
        <div id="intro">
          <h2>Welcome</h2>
          <p>Some description here...</p>
        </div>

        {isLoading ? (
          <p>Loading blogs...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div id="cards">
            <div className="card-container">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div className="row" key={blog.title}>
                    <div className="card hoverable">
                      <Link to={`/blog/${encodeURIComponent(blog.id)}`}>
                        <div className="card-content grey darken-3">
                          <span className="card-title">{blog.title}</span>
                          <p>{blog.description}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>No featured blogs available.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Home;