import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Blog.css';

const PostDetail = () => {
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchBlog = async (authStatus) => {
      const endpoint = authStatus 
        ? `${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}`
        : `${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}/pub`;

      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Post not found');
        }

        const data = await response.json();
        setBlog(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });
        const authStatus = response.ok;
        setIsAuthenticated(authStatus);
        fetchBlog(authStatus);
      } catch (error) {
        setIsAuthenticated(false);
        setError('Failed to check authentication');
      }
    };

    checkAuth();
  }, [id]);

  if (error) return <div className="error">{error}</div>;
  if (!blog) return <div>Loading...</div>;

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <article>
        <h1>{blog.title}</h1>

        {blog.article_img && (
          <img 
            id="article-img" 
            alt="Article Image" 
            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${blog.article_img}`}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '1rem' }}
            onError={(e) => {
              console.error('Error loading image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        <p className="date">Created: {new Date(blog.created_at).toLocaleDateString()}</p>
        <p className="date">Last Update: {new Date(blog.updated_at).toLocaleDateString()}</p>

        <div id="content" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>
      {isAuthenticated && (
        <Link to={`/blog/edit/${encodeURIComponent(blog.id)}`} className="btn btn-warning">Edit Post</Link>
      )}
    </Layout>
  );
};

export default PostDetail;