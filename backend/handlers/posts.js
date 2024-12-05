import { db } from '../models/db.js';
import logger from '../utils/logger.js';

export const getAllPosts = (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error(`Failed to get all blog posts: ${err.message}`);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

export const getPost = (req, res) => {
  const title = req.params.title;
  db.get('SELECT * FROM blog_posts WHERE title = ? AND is_deleted = 0', [title], (err, row) => {
    if (err) {
      logger.error(`Failed to get blog post: ${err.message}`);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(row);
  });
};

export const createPost = (req, res) => {
  const { title, description, content, author_id } = req.body;
  db.run('INSERT INTO blog_posts (title, description, content, author_id) VALUES (?, ?, ?, ?)',
    [title, description, content, author_id],
    function(err) {
      if (err) {
        logger.error(`Failed to create blog post: ${err.message}`);
        res.status(500).json({ error: err.message });
        return;
      }
      logger.info(`Blog post created: ${title}`);
      res.status(201).json({ id: this.lastID });
    }
  );
};

export const updatePost = (req, res) => {
  const { title, description, content } = req.body;
  const oldTitle = req.params.title;
  db.run('UPDATE blog_posts SET title = ?, description = ?, content = ? WHERE title = ?',
    [title, description, content, oldTitle],
    function(err) {
      if (err) {
        logger.error(`Failed to update blog post: ${err.message}`);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
};

export const recoverPost = (req, res) => {
  const { title } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 0 WHERE title = ?', [title], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    logger.info(`Blog post recovered: ${title}`);
    res.json({ changes: this.changes });
  });
};

export const updatePostStatus = (req, res) => {
  const { is_favorite, is_public } = req.body;
  const title = req.params.title;

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
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const sql = `UPDATE blog_posts SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE title = ?`;
  params.push(title);

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ changes: this.changes });
  });
};

export const deletePost = (req, res) => {
  const { title } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 1 WHERE title = ?', [title], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    logger.info(`Blog post deleted: ${title}`);
    res.json({ changes: this.changes });
  });
};

export const permanentDeletePost = (req, res) => {
  const { title } = req.body;
  db.run('DELETE FROM blog_posts WHERE title = ?', [title], function(err) {
    if (err) {
      logger.error(`Failed to permanently delete blog post: ${err.message}`);
      res.status(500).json({ error: err.message });
      return;
    }
    logger.info(`Blog post permanently deleted: ${title}`);
    res.json({ changes: this.changes });
  });
};

export const getPostImages = (req, res) => {
  const title = req.params.title;
  db.get('SELECT id FROM blog_posts WHERE title = ? AND is_deleted = 0', [title], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }

    db.all('SELECT * FROM images WHERE blog_id = ?', [row.id], (err, images) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(images);
    });
  });
};

export const getFeaturedPosts = (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_favorite = 1 AND is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

export const getPublishedPosts = (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

export const getAllPostsIncludingDeleted = (req, res) => {
  db.all('SELECT * FROM blog_posts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};