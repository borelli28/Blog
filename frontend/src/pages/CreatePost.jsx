import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import '../styles/CustomEasyMDE.css';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Removes any non-alphanumeric characters except whitespace
  const sanitizeInput = (input) => {
    return input.replace(/[^\w\s]/g, '');
  };

  useEffect(() => {
    checkAuth();
    // Check if the textarea reference is available
    if (editorRef.current) {
      // Initialize EasyMDE on the textarea
      const easyMDE = new EasyMDE({
        element: editorRef.current,
        autofocus: true,
        spellChecker: true
      });

      return () => {
        // Convert the EasyMDE instance back to a regular textarea
        easyMDE.toTextArea();
        // Perform any necessary cleanup for the EasyMDE instance
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const blogData = {
      title: sanitizeInput(formData.get('title')),
      description: sanitizeInput(formData.get('desc')),
      content: formData.get('content'),
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
        navigate('/dashboard');
      } else {
        console.error('Failed to create blog post');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main>
      <Navbar />
      <h2>Create Blog</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input type="text" className="form-control" name="title" required/>
      
          <label htmlFor="desc">Description</label>
          <input type="text" className="form-control" name="desc" required/>
          
          <label htmlFor="content">Content</label>
          <textarea id="editor" name="content" ref={editorRef}></textarea>

          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    </main>
  );
};

export default CreatePost;
