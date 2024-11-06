import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EditPost from './pages/EditPost';
import Logs from './pages/Logs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<PostList />} />
        <Route path="/blog/:title" element={<PostDetail />} />
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/blog/edit/:title" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;