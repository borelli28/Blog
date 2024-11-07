import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface Blog {
  title: string;
  description: string;
  is_favorite: boolean;
  is_public: boolean;
}

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div className="row" key={blog.title}>
                <div className="card hoverable">
                  <Link to={`/blog/${encodeURIComponent(blog.title)}`}>
                    <div className="card-content grey darken-3">
                      <span className="card-title">{blog.title}</span>
                      <p>{blog.description}</p>
                      {blog.is_favorite && <span className="badge">Favorite</span>}
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No featured blogs available.</p>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Home;