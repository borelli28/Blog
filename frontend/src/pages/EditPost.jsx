import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../services/csrf';
import Layout from '../components/Layout';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import '../styles/CreatePost.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [images, setImages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchBlogAndImages = async () => {
      try {
        const blogResponse = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}`, {
          credentials: 'include',
        });
        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          setBlog(blogData);

          const imagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}/images`, {
            credentials: 'include',
          });
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            setImages(imagesData);
          } else {
            setMessages(prevMessages => [...prevMessages, 'Failed to fetch images']);
          }
        } else {
          setMessages(['Failed to fetch blog']);
        }
      } catch (error) {
        console.error("Error fetching blog and images:", error);
        setMessages(['An error occurred while fetching the blog and images']);
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

    fetchBlogAndImages();
    checkAuth();
  }, [id]);

  useEffect(() => {
    if (editorRef.current) {
      const easyMDE = new EasyMDE({ element: editorRef.current });
      return () => {
        easyMDE.toTextArea();
        easyMDE.cleanup();
      };
    }
  }, [blog]);

  // Removes any non-alphanumeric characters except whitespace
  const sanitizeInput = (input) => {
    return input.replace(/[^\w\s]/g, '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const blogData = {
      title: sanitizeInput(formData.get('title')),
      description: sanitizeInput(formData.get('desc')),
      content: formData.get('content'),
      article_img: formData.get('article_img'),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': getCSRFToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        setMessages(['Failed to delete blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while deleting the blog']);
    }
  };

  const handleArticleImageUpload = async (event) => {
    event.preventDefault();
    
    if (!blog) {
      setMessages(['Blog data not available. Please try again.']);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append('blog_id', blog.id.toString());
    
    if (!formData.get('description')) {
      formData.append('description', 'Article image');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images/upload-article`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': getCSRFToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(['Article image uploaded successfully']);
        setBlog(prevBlog => prevBlog ? {...prevBlog, article_img: result.filename} : null);
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to upload article image']);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(['An error occurred while uploading the article image']);
    }
  };

  const handleBlogImageUpload = async (event) => {
    event.preventDefault();
    
    if (!blog) {
      setMessages(['Blog data not available. Please try again.']);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append('blog_id', blog.id.toString());
    
    if (!formData.get('description')) {
      formData.append('description', 'Blog content image');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': getCSRFToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(['Blog image uploaded successfully']);
        setImages(prevImages => [...prevImages, {id: result.id, image: result.filename, description: formData.get('description')}]);
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to upload blog image']);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(['An error occurred while uploading the blog image']);
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({ id: imageId }),
        credentials: 'include',
      });

      if (response.ok) {
        setMessages(['Image deleted successfully']);
        setImages(prevImages => prevImages.filter(img => img.id !== imageId));
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to delete image']);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessages(['An error occurred while deleting the image']);
    }
  };

  const handleImageDescriptionUpdate = async (imageId, newDescription) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images/alt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({ id: imageId, description: newDescription }),
        credentials: 'include',
      });

      if (response.ok) {
        setMessages(['Image description updated successfully']);
        setImages(prevImages =>
          prevImages.map(img =>
            img.id === imageId ? { ...img, description: newDescription } : img
          )
        );
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to update image description']);
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessages(['An error occurred while updating the image description']);
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
              <input type="text" className="form-control" name="title" defaultValue={blog.title} required/>
              
              {blog.article_img && (
                <>
                  <label htmlFor="article_img">Article Image</label>
                  <input type="text" className="form-control" name="article_img" defaultValue={blog.article_img} required/>
                </>
              )}

              <label htmlFor="desc">Description</label>
              <input type="text" className="form-control" name="desc" defaultValue={blog.description} required/>

              <label htmlFor="content">Content</label>
              <textarea name="content" id="editor" ref={editorRef} defaultValue={blog.content}></textarea>

              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>

          <div id="actions">
            <button
              onClick={() => navigate(`/blog/${encodeURIComponent(blog.id)}`)}
              className="btn btn-info"
            >
              See Preview
            </button>
            <button onClick={handleDelete} className="btn btn-danger">Delete Post</button>
          </div>

          <div id="images">
            <div id="img-upload-container">
              <form onSubmit={handleArticleImageUpload} encType="multipart/form-data">
                <label htmlFor="article_image">Upload Article Image</label>
                <input type="file" id="article_image" name="image" required/>
                <button type="submit" className="btn btn-primary">Upload Article Image</button>
              </form>

              <form onSubmit={handleBlogImageUpload} encType="multipart/form-data">
                <label htmlFor="blog_image">Upload a Blog Image</label>
                <input type="file" id="blog_image" name="image" required/>
                <button type="submit" className="btn btn-primary">Upload Blog Image</button>
              </form>
            </div>
            <div id="images-container">
              <h6>Blog Images</h6>
              {images.map((img) => (
                <div key={img.id} id="image">
                  <p>{img.image}</p>
                  <div id="img-container">
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${img.image}`} 
                      alt={img.description} 
                    />
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newDescription = e.currentTarget.img_desc.value;
                      handleImageDescriptionUpdate(img.id, newDescription);
                    }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="img_desc" 
                        defaultValue={img.description}
                        required
                      />
                      <button type="submit" className="btn btn-secondary">Edit Description</button>
                    </form>
                    <button onClick={() => handleImageDelete(img.id)} className="btn btn-danger">
                      Delete Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default EditPost;