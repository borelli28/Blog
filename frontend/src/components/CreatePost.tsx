import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      const easyMDE = new EasyMDE({ element: editorRef.current });
      return () => {
        easyMDE.toTextArea();
        easyMDE.cleanup();
      };
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const blogData = {
      title: formData.get('title'),
      description: formData.get('desc'),
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
        navigate('/blogs');
      } else {
        console.error('Failed to create blog post');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout username="exampleUser">
      <div>
        <h2>Create Blog</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" className="form-control" name="title" />
        
            <label htmlFor="desc">Description</label>
            <input type="text" className="form-control" name="desc" />
        
            <label htmlFor="content">Content</label>
            <textarea id="editor" name="content" ref={editorRef}></textarea>

            <button type="submit" className="btn light-blue">Submit</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;