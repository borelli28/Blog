import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <nav>
        <ul>
          <li><Link to="/" className="btn light-blue">Home</Link></li>
          <li><Link to="/blogs" className="btn light-blue">Blogs</Link></li>
          <li><Link to="/admin" className="btn light-blue">Admin</Link></li>
          <li><Link to="/logs_page" className="btn light-blue">Logs</Link></li>
        </ul>
      </nav>

      <main>
        {messages.length > 0 && (
          <ul className="messages">
            {messages.map((message, index) => (
              <li key={index} className="alert-danger">{message}</li>
            ))}
          </ul>
        )}

        <div id="blogs">
          {blogs.map(blog => (
            <div key={blog.id} id="blog">
              <h4>{blog.title}</h4>
              <h6>Created: {blog.created_at}</h6>
              <h6>Last update: {blog.updated_at}</h6>

              {!blog.is_favorite && (
                <button onClick={() => handleBlogAction(blog.title, 'is_fav', true)} className="btn">
                  Mark as Favorite
                </button>
              )}
              {!blog.is_public && (
                <button onClick={() => handleBlogAction(blog.title, 'is_pub', true)} className="btn">
                  Publish Blog
                </button>
              )}
              {blog.is_favorite && (
                <button onClick={() => handleBlogAction(blog.title, 'is_fav', false)} className="btn">
                  Unfavorite
                </button>
              )}
              {blog.is_public && (
                <button onClick={() => handleBlogAction(blog.title, 'is_pub', false)} className="btn">
                  Unpublish Blog
                </button>
              )}

              <Link to={`/edit_blog_page/${blog.title}`} className="btn light-blue">Edit</Link>
              <Link to={`/blog/${blog.title}`} className="btn light-blue">See Preview</Link>
            </div>
          ))}
          <Link to="/blogs" className="btn light-blue">Go to Blogs Page</Link>
        </div>
      </main>

      <div id="deleted-blogs">
        {blogs.filter(blog => blog.is_deleted).map(blog => (
          <div key={blog.id}>
            <h6>{blog.title}</h6>
            <h6>Last update: {blog.updated_at}</h6>
            <button onClick={() => handleBlogAction(blog.title, 'perm_delete', true)} className="btn red">
              Permanently Delete
            </button>
          </div>
        ))}
      </div>

      <footer>
        <div id="update-password">
          <h6>Update Password</h6>
          <form onSubmit={handlePasswordUpdate}>
            <label htmlFor="password">New Password</label>
            <input
              name="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit" className="btn">Change Password</button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;