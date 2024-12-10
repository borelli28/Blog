import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import '../styles/CreatePost.css';
import DOMPurify from 'dompurify';

const CreatePost = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    if (editorRef.current) {
      const easyMDE = new EasyMDE({ element: editorRef.current });
      return () => {
        easyMDE.toTextArea();
        easyMDE.cleanup();
      };
    }
  }, []);

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

  const sanitizeInput = (input) => {
    return input.replace(/[^\w\s]/gi, ''); // Allows only alphanumeric characters and whitespace
  };

  const sanitizeContent = (content) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li', 'img'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src'],
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const blogData = {
      title: sanitizeInput(formData.get('title')),
      description: sanitizeInput(formData.get('desc')),
      content: sanitizeContent(formData.get('content')),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/blogs');
      } else {
        console.error('Failed to create blog post');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <main>
        <h2>Create Blog</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" className="form-control" name="title" required />

            <label htmlFor="desc">Description</label>
            <input type="text" className="form-control" name="desc" required />

            <label htmlFor="content">Content</label>
            <textarea id="editor" name="content" ref={editorRef} required></textarea>

            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </main>
    </Layout>
  );
};

export default CreatePost;