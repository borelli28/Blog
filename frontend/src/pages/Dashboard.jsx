import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(4);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.filter(blog => !blog.is_deleted).slice(indexOfFirstBlog, indexOfLastBlog);

  useEffect(() => {
    fetchBlogs();
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/getUsername`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
      } else {
        console.error('Failed to fetch username');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

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

  const sanitizeInput = (input) => {
    return input.replace(/[^\w\s]/gi, ''); // Allows only alphanumeric characters and whitespace
  };

  const handleFavoriteToggle = async (blogId, isFavorite) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(blogId)}/status`, {
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

  const handlePublishToggle = async (blogId, isPublic) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(blogId)}/status`, {
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

  const handlePermanentDelete = async (blogId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/permanent`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: sanitizeInput(blogId) }),
        credentials: 'include',
      });
      if (response.ok) {
        fetchBlogs();
        setMessages(['Blog permanently deleted']);
      } else {
        setMessages(['Failed to permanently delete blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while permanently deleting the blog']);
    }
  };

  const handleRecoverBlog = async (blogId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(blogId)}/recover`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: sanitizeInput(blogId) }),
        credentials: 'include',
      });
      if (response.ok) {
        fetchBlogs();
        setMessages(['Blog recovered']);
      } else {
        setMessages(['Failed to recover blog']);
      }
    } catch (error) {
      setMessages(['An error occurred while recovering the blog']);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const safeUsername = sanitizeInput(username);
    const safePassword = sanitizeInput(password);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: safeUsername, password: safePassword }),
        credentials: 'include',
      });
      if (response.ok) {
        setMessages(['Password updated successfully']);
        setPassword('');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update password';
        setMessages([errorMessage]);
      }
    } catch (error) {
      setMessages([error.message || 'An error occurred while updating the password']);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const Pagination = ({ blogsPerPage, totalBlogs, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalBlogs / blogsPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <a onClick={() => paginate(number)} href="#!" className="page-link">
                {number}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
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
            {currentBlogs.map(blog => (
              <div key={blog.id} className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">{blog.title}</h4>
                    <h6 className="card-subtitle mb-2 text-muted">Created: {blog.created_at}</h6>
                    <h6 className="card-subtitle mb-2 text-muted">Last update: {blog.updated_at}</h6>
                    <div className="btn-group mt-3" role="group">
                      <button onClick={() => handleFavoriteToggle(blog.id, !blog.is_favorite)}
                        className={`btn ${blog.is_favorite ? 'btn-success' : 'btn-outline-success'}`}
                      >
                        {blog.is_favorite ? 'Unfavorite' : 'Mark as Favorite'}
                      </button>
                      <button onClick={() => handlePublishToggle(blog.id, !blog.is_public)}
                        className={`btn ${blog.is_public ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        {blog.is_public ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                    <div className="mt-3">
                      <Link to={`/blog/edit/${blog.id}`} className="btn btn-warning me-2">Edit</Link>
                      <Link to={`/blog/${blog.id}`} className="btn btn-info">See Preview</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            blogsPerPage={blogsPerPage}
            totalBlogs={blogs.filter(blog => !blog.is_deleted).length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </main>
        <div id="deleted-blogs" className="container mb-4">
          <h5>Deleted Blogs</h5>
          {blogs.filter(blog => blog.is_deleted).map(blog => (
            <div key={blog.id} className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{blog.title}</h6>
                <p className="card-text">Last update: {blog.updated_at}</p>
                <button onClick={() => handlePermanentDelete(blog.id)} className="btn btn-danger">
                  Permanently Delete
                </button>
                <button onClick={() => handleRecoverBlog(blog.id)} className="btn btn-primary">
                  Recover
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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