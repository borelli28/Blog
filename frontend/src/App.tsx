import React from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Home from './components/Home'
import PostList from './components/PostList'
import PostDetail from './components/PostDetail'
import CreatePost from './components/CreatePost'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/posts">Posts</Link></li>
            <li><Link to="/create">Create Post</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App