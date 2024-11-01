import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface Blog {
  title: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
  article_img?: string;
  is_public: boolean;
  author: {
    username: string;
  };
}

const PostDetail: React.FC = () => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const { title } = useParams<{ title: string }>();
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${encodeURIComponent(title!)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setBlog(data);
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
    setUsername('exampleUser');
  }, [title]);

  if (!blog) return <div>Loading...</div>;

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <article>
        <h1>{blog.title}</h1>
        {blog.article_img && <img id="article-img" alt="Article Image" src={blog.article_img} />}
        <p className="date">Created: {new Date(blog.created_at).toLocaleDateString()}</p>
        <p className="date">Last Update: {new Date(blog.updated_at).toLocaleDateString()}</p>
        
        <div id="content" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>
    </Layout>
  );

  // return (
  //   <Layout username={username}>
  //     {(blog.is_public || blog.author.username === username) && (
  //       <article>
  //         <h1>{blog.title}</h1>
  //         {blog.article_img && <img id="article-img" alt="Article Image" src={blog.article_img} />}
  //         <p className="date">Created: {new Date(blog.created_at).toLocaleDateString()}</p>
  //         <p className="date">Last Update: {new Date(blog.updated_at).toLocaleDateString()}</p>
          
  //         <div id="content" dangerouslySetInnerHTML={{ __html: blog.content }} />
  //       </article>
  //     )}
  //     {blog.author.username === username && (
  //       <Link to={`/edit/${encodeURIComponent(blog.title)}`} className="btn light-blue">Edit Post</Link>
  //     )}
  //   </Layout>
  // );
};

export default PostDetail;