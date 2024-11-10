import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Dashboard.css';

interface Blog {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_public: boolean;
  is_deleted: boolean;
  article_img?: string;
}

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/all`, {
        credentials: 'include',
      });
      if (response.ok) {
        const fetchedBlogs = await response.json();
        setBlogs(fetchedBlogs);
      } else {
        setMessages(['Failed to fetch blogs']);
      }
    } catch (error) {
      setMessages(['An error occurred while fetching blogs']);
    }
  };

  const handleFavoriteToggle = async (blogTitle: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(blogTitle)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchBlogs();
        setMessages([`Blog ${isFavorite ? 'marked as favorite' : 'removed from favorites'}`]);
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to update favorite status']);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      setMessages(['An error occurred while updating favorite status']);
    }
  };

  const handlePublishToggle = async (blogTitle: string, isPublic: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(blogTitle)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: isPublic }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchBlogs();
        setMessages([`Blog ${isPublic ? 'published' : 'unpublished'}`]);
      } else {
        const errorData = await response.json();
        setMessages([errorData.error || 'Failed to update publish status']);
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      setMessages(['An error occurred while updating publish status']);
    }
  };

  const handlePermanentDelete = async (blogTitle: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/permanent`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: blogTitle }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchBlogs();
        console.log(response);
        setMessages(['Blog permanently deleted']);
      } else {
        setMessages(['Failed to permanently delete blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while permanently deleting the blog']);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
        credentials: 'include',
      });

      if (response.ok) {
        setMessages(['Password updated successfully']);
        setNewPassword('');
      } else {
        setMessages(['Failed to update password']);
      }
    } catch (error) {
      setMessages(['An error occurred while updating the password']);
    }
  };

return (
    <Layout isAuthenticated={true}>
      <div className="container-fluid">
        <main className="container">
          {messages.length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0">
                {messages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div id="blogs" className="row">
            {blogs.filter(blog => !blog.is_deleted).map(blog => (
              <div key={blog.id} className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">{blog.title}</h4>
                    <h6 className="card-subtitle mb-2 text-muted">Created: {blog.created_at}</h6>
                    <h6 className="card-subtitle mb-2 text-muted">Last update: {blog.updated_at}</h6>

                    <div className="btn-group mt-3" role="group">
                      <button 
                        onClick={() => handleFavoriteToggle(blog.title, !blog.is_favorite)} 
                        className={`btn ${blog.is_favorite ? 'btn-success' : 'btn-outline-success'}`}
                      >
                        {blog.is_favorite ? 'Unfavorite' : 'Mark as Favorite'}
                      </button>
                      <button 
                        onClick={() => handlePublishToggle(blog.title, !blog.is_public)} 
                        className={`btn ${blog.is_public ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        {blog.is_public ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>

                    <div className="mt-3">
                      <Link to={`/blog/edit/${blog.title}`} className="btn btn-warning me-2">Edit</Link>
                      <Link to={`/blog/${blog.title}`} className="btn btn-info">See Preview</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/blogs" className="btn btn-primary mb-4">Go to Blogs Page</Link>
        </main>

        <div id="deleted-blogs" className="container mb-4">
          <h5>Deleted Blogs</h5>
          {blogs.filter(blog => blog.is_deleted).map(blog => (
            <div key={blog.id} className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{blog.title}</h6>
                <p className="card-text">Last update: {blog.updated_at}</p>
                <button onClick={() => handlePermanentDelete(blog.title)} className="btn btn-danger">
                  Permanently Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="container mb-4">
          <div id="update-password" className="card">
            <div className="card-body">
              <h6 className="card-title">Update Password</h6>
              <form onSubmit={handlePasswordUpdate}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Change Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;