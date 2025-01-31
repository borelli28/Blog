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
          // Filter out featured blogs from all blogs
          const featuredIds = new Set(featured.map(blog => blog.id));
          const nonFeaturedBlogs = published.filter(blog => !featuredIds.has(blog.id));
          setAllBlogs(nonFeaturedBlogs);
        } else {
          setError('Failed to fetch blogs');
        }
      } catch (error) {
        setError('An error occurred while fetching blogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBlogs();
  }, []);

  const renderBlog = (blog) => (
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
  );

  return (
    <div id="home-container">
      <Navbar />
      <div id="intro">
        <h2>Welcome!</h2>
        <p>I write sometimes about whatever I'm working or interested on</p>
      </div>

      {isLoading ? (
        <p>Loading blogs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div id="content">
          <div className="card-container">
            {featuredBlogs.map(renderBlog)}
            {allBlogs.map(renderBlog)}
          </div>
          {!featuredBlogs.length && !allBlogs.length && (
            <p>No blogs available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;