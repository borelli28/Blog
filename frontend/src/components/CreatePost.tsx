import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })
      if (!response.ok) {
        throw new Error('Failed to create post')
      }
      navigate('/posts')
    } catch (error) {
      setError('Error creating post. Please try again.')
    }
  }

  return (
    <div>
      <h2>Create New Post</h2>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  )
}

export default CreatePost