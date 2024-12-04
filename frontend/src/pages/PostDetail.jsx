import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Blog.css';

const PostDetail = () => {
  const [blog, setBlog] = useState(null);
  const { title } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setBlog(data);
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
    fetchBlog();
    checkAuth();
  }, [title]);

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
        <Link to={`/blog/edit/${encodeURIComponent(blog.title)}`} className="btn btn-warning">Edit Post</Link>
      )}
    </Layout>
  );
};

export default PostDetail;