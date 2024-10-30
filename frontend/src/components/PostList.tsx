import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Post {
  id: number
  title: string
  description: string
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
        setLoading(false)
      } catch (error) {
        setError('Error fetching posts. Please try again later.')
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      <h2>Blog Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/posts/${encodeURIComponent(post.title)}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PostList