import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface Blog {
  title: string;
  description: string;
}

const PostList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
      const data = await response.json();
      setBlogs(data);
    };
    fetchBlogs();
  }, []);

  return (
    <Layout>
      <div id="cards">
        {blogs.map((blog) => (
          <div className="row" key={blog.title}>
            <div className="card hoverable grey darken-3">
              <Link to={`/blog/${encodeURIComponent(blog.title)}`} className="card-content white-text">
                <span className="card-title">{blog.title}</span>
                <p>{blog.description}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default PostList;