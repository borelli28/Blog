import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

interface Blog {
  id: number;
  title: string;
  description: string;
  content: string;
  article_img?: string;
  created_at: string;
}

interface Image {
  id: number;
  image: string;
  description: string;
}

const EditPost: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title!)}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
          setImages(data.images || []);
        } else {
          setMessages(['Failed to fetch blog']);
        }
      } catch (error) {
        setMessages(['An error occurred while fetching the blog']);
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
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    fetchBlog();
    checkAuth();
  }, [title]);

  useEffect(() => {
    if (editorRef.current) {
      const easyMDE = new EasyMDE({ element: editorRef.current });
      return () => {
        easyMDE.toTextArea();
        easyMDE.cleanup();
      };
    }
  }, [blog]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const blogData = {
      title: formData.get('title'),
      description: formData.get('desc'),
      content: formData.get('content'),
      article_img: formData.get('article_img'),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title!)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
        credentials: 'include',
      });

      if (response.ok) {
        setMessages(['Blog updated successfully']);
      } else {
        setMessages(['Failed to update blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while updating the blog']);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title!)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/blogs');
      } else {
        setMessages(['Failed to delete blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while deleting the blog']);
    }
  };

  const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload_img`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setMessages(['Image uploaded successfully']);
        // Refresh images
        const blogResponse = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title!)}`, {
          credentials: 'include',
        });
        if (blogResponse.ok) {
          const data = await blogResponse.json();
          setImages(data.images || []);
        }
      } else {
        setMessages(['Failed to upload image']);
      }
    } catch (error) {
      setMessages(['An error occurred while uploading the image']);
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <main className="container">
        {messages.length > 0 && (
          <ul className="messages">
            {messages.map((message, index) => (
              <li key={index} className="alert alert-danger">{message}</li>
            ))}
          </ul>
        )}
        <div>
          <h2>Edit Blog</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input type="text" className="form-control" name="title" defaultValue={blog.title} />
              
              {blog.article_img && (
                <>
                  <label htmlFor="article_img">Article Image</label>
                  <input type="text" className="form-control" name="article_img" defaultValue={blog.article_img} />
                </>
              )}

              <label htmlFor="desc">Description</label>
              <input type="text" className="form-control" name="desc" defaultValue={blog.description} />

              <label htmlFor="content">Content</label>
              <textarea name="content" id="editor" ref={editorRef} defaultValue={blog.content}></textarea>

              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
          <Link to="/blogs" className="btn btn-secondary">Go to Blogs</Link>
          <Link to={`/blog/${encodeURIComponent(blog.title)}`} className="btn btn-info">See Preview</Link>
          
          <button onClick={handleDelete} className="btn btn-danger">Delete Post</button>

          <div id="img-upload-container">
            <form onSubmit={handleImageUpload} encType="multipart/form-data">
              <label htmlFor="article_img">Upload Article Image</label>
              <input type="file" id="image" name="article_img" />
              <button type="submit" className="btn btn-primary">Upload</button>
            </form>

            <form onSubmit={handleImageUpload} encType="multipart/form-data">
              <label htmlFor="blog_img">Upload a Blog Image</label>
              <input type="file" id="image" name="blog_img" />
              <button type="submit" className="btn btn-primary">Upload</button>
            </form>
          </div>
          <div id="images-container">
            <h6>Blog Images</h6>
            {images.map((img) => (
              <div key={img.id} id="image">
                <p>{img.image}</p>
                <div id="img-container">
                  <img src={img.image} alt={img.description} />
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // Handle image description update
                  }}>
                    <input type="text" className="form-control" name="img_desc" defaultValue={img.description} />
                    <button type="submit" className="btn btn-secondary">Edit Description</button>
                  </form>
                  <button onClick={() => {
                    // Handle image deletion
                  }} className="btn btn-danger">Delete Image</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default EditPost;