import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
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

  const handleBlogAction = async (blogTitle: string, action: string, value: boolean) => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/posts/${blogTitle}`;
      let method = 'PUT';
      let body: any = {};

      if (action === 'perm_delete') {
        url = `${import.meta.env.VITE_API_URL}/posts/permanent`;
        method = 'DELETE';
        body = { title: blogTitle };
      } else if (action === 'is_fav' || action === 'is_pub') {
        body[action] = value;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        fetchBlogs();
        setMessages(['Blog updated successfully']);
      } else {
        setMessages(['Failed to update blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while updating the blog']);
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
            {blogs.map(blog => (
              <div key={blog.id} id="blog" className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">{blog.title}</h4>
                    <h6 className="card-subtitle mb-2 text-muted">Created: {blog.created_at}</h6>
                    <h6 className="card-subtitle mb-2 text-muted">Last update: {blog.updated_at}</h6>

                    <div className="btn-group mt-3" role="group">
                      {!blog.is_favorite && (
                        <button onClick={() => handleBlogAction(blog.title, 'is_fav', true)} className="btn btn-outline-success">
                          Mark as Favorite
                        </button>
                      )}
                      {!blog.is_public && (
                        <button onClick={() => handleBlogAction(blog.title, 'is_pub', true)} className="btn btn-outline-primary">
                          Publish Blog
                        </button>
                      )}
                      {blog.is_favorite && (
                        <button onClick={() => handleBlogAction(blog.title, 'is_fav', false)} className="btn btn-success">
                          Unfavorite
                        </button>
                      )}
                      {blog.is_public && (
                        <button onClick={() => handleBlogAction(blog.title, 'is_pub', false)} className="btn btn-primary">
                          Unpublish Blog
                        </button>
                      )}
                    </div>

                    <div className="mt-3">
                      <Link to={`/edit_blog_page/${blog.title}`} className="btn btn-warning me-2">Edit</Link>
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
                <button onClick={() => handleBlogAction(blog.title, 'perm_delete', true)} className="btn btn-danger">
                  Permanently Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="container mb-4">
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
        </footer>
      </div>
    </Layout>
  );
};

export default Dashboard;