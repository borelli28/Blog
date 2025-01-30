import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      setIsLoading(true);
      try {
        // Fetch both featured and published blogs
        const [featuredResponse, publishedResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/posts/featured`, {
            credentials: 'include',
          }),
          fetch(`${import.meta.env.VITE_API_URL}/posts/published`, {
            credentials: 'include',
          })
        ]);

        if (featuredResponse.ok && publishedResponse.ok) {
          const featured = await featuredResponse.json();
          const published = await publishedResponse.json();
          setFeaturedBlogs(featured);
          setAllBlogs(published);
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

    fetchAllBlogs();
    checkAuth();
  }, []);

  const renderBlogs = (blogs, title) => (
    <div className="blog-section">
      <h3>{title}</h3>
      <div className="card-container">
        {blogs.map((blog) => (
          <div className="row" key={blog.title}>
            <div className="card hoverable">
              <Link to={`/blog/${encodeURIComponent(blog.id)}`}>
                <div className="card-content grey darken-3">
                  <span className="card-title">{blog.title}</span>
                  <p className="card-description">{blog.description}</p>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div id="home-container">
      <Navbar />
      <div id="intro">
        <h2>Welcome!</h2>
        <p>Writing sometimes about whatever I'm working on these days</p>
      </div>

      {isLoading ? (
        <p>Loading blogs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div id="content">
          {featuredBlogs.length > 0 && renderBlogs(featuredBlogs, "Featured Posts")}
          {allBlogs.length > 0 && renderBlogs(allBlogs, "All Posts")}
          {!featuredBlogs.length && !allBlogs.length && (
            <p>No blogs available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;