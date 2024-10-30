import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

interface Post {
  id: number
  title: string
  content: string
}

const PostDetail: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }
        const data = await response.json()
        setPost(data)
        setLoading(false)
      } catch (error) {
        setError('Error fetching post. Please try again later.')
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!post) return <div>Post not found</div>

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
    </div>
  )
}

export default PostDetail