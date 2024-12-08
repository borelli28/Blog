import { db } from '../models/db.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';

const getUsername = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    req.username = await getUsernameFromToken(token);
  } catch (error) {
    req.username = 'anonymous';
  }
  next();
};

export const getAllPosts = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error(`Failed to get all blog posts`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('All blog posts retrieved', '', { username: req.username });
    res.json(rows);
  });
}];

export const getPost = [getUsername, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
    if (err) {
      logger.error(`Failed to get blog post`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      logger.infoWithMeta('Blog post not found', id, { username: req.username });
      return res.status(404).json({ error: 'Post not found' });
    }
    logger.infoWithMeta('Blog post retrieved', id, { username: req.username });
    res.json(row);
  });
}];

export const createPost = [getUsername, (req, res) => {
  const { title, description, content, author_id } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO blog_posts (id, title, description, content, author_id) VALUES (?, ?, ?, ?, ?)',
    [id, title, description, content, author_id],
    function(err) {
      if (err) {
        logger.error(`Failed to create blog post`, {
          error: err.message,
          stack: err.stack,
          username: req.username,
          postTitle: title
        });
        return res.status(500).json({ error: err.message });
      }
      logger.infoWithMeta('Blog post created', title, { username: req.username, postId: id });
      res.status(201).json({ id: id });
    }
  );
}];

export const updatePost = [getUsername, (req, res) => {
  const { title, description, content } = req.body;
  const id = req.params.id;
  db.run('UPDATE blog_posts SET title = ?, description = ?, content = ? WHERE id = ?',
    [title, description, content, id],
    function(err) {
      if (err) {
        logger.error(`Failed to update blog post`, {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        logger.infoWithMeta('Blog post not found for update', id, { username: req.username });
        return res.status(404).json({ message: 'Post not found' });
      }
      logger.infoWithMeta('Blog post updated', id, { username: req.username });
      res.json({ changes: this.changes });
    }
  );
}];

export const recoverPost = [getUsername, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      logger.error(`Failed to recover blog post`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Blog post recovered', id, { username: req.username, postId: id });
    res.json({ changes: this.changes });
  });
}];

export const updatePostStatus = [getUsername, (req, res) => {
  const { is_favorite, is_public } = req.body;
  const id = req.params.id;

  let updateFields = [];
  let params = [];
  if (is_favorite !== undefined) {
    updateFields.push('is_favorite = ?');
    params.push(is_favorite);
  }
  if (is_public !== undefined) {
    updateFields.push('is_public = ?');
    params.push(is_public);
  }

  if (updateFields.length === 0) {
    logger.infoWithMeta('No valid fields to update', id, { username: req.username });
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const sql = `UPDATE blog_posts SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  params.push(id);

  db.run(sql, params, function(err) {
    if (err) {
      logger.error(`Failed to update blog post status`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      logger.infoWithMeta('Blog post not found for status update', id, { username: req.username });
      return res.status(404).json({ error: 'Post not found' });
    }
    logger.infoWithMeta('Blog post status updated', id, { username: req.username });
    res.json({ changes: this.changes });
  });
}];

export const deletePost = [getUsername, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      logger.error(`Failed to delete blog post`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Blog post deleted', id, { username: req.username, postId: id });
    res.json({ changes: this.changes });
  });
}];

export const permanentDeletePost = [getUsername, (req, res) => {
  const { id } = req.body;
  db.run('DELETE FROM blog_posts WHERE id = ?', [id], function(err) {
    if (err) {
      logger.error(`Failed to permanently delete blog post`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Blog post permanently deleted', id, { username: req.username, postId: id });
    res.json({ changes: this.changes });
  });
}];

export const getPostImages = [getUsername, (req, res) => {
  const id = req.params.id;
  db.get('SELECT id FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
    if (err) {
      logger.error(`Failed to get post for images`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      logger.infoWithMeta('Post not found for image retrieval', id, { username: req.username });
      return res.status(404).json({ error: 'Post not found' });
    }

    db.all('SELECT * FROM images WHERE blog_id = ?', [row.id], (err, images) => {
      if (err) {
        logger.error(`Failed to get images for post`, {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: err.message });
      }
      logger.infoWithMeta('Post images retrieved', id, { username: req.username });
      res.json(images);
    });
  });
}];

export const getFeaturedPosts = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_favorite = 1 AND is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error(`Failed to get featured posts`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Featured posts retrieved', '', { username: req.username });
    res.json(rows);
  });
}];

export const getPublishedPosts = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error(`Failed to get published posts`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Published posts retrieved', '', { username: req.username });
    res.json(rows);
  });
}];

export const getAllPostsIncludingDeleted = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error(`Failed to get all posts including deleted`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('All posts including deleted retrieved', '', { username: req.username });
    res.json(rows);
  });
}];