import { db } from '../models/db.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

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
  const id = req.params.id;
  db.get('SELECT * FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
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
  const { title, description, content, author_id, article_img, is_favorite, is_public } = req.body;
  const id = uuidv4();
  db.run(`INSERT INTO blog_posts (id, title, article_img, description, content, author_id, is_favorite, is_public) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, article_img, description, content, author_id, is_favorite || false, is_public || false],
    function(err) {
      if (err) {
        logger.error(`Failed to create blog post: ${err.message}`);
        res.status(500).json({ error: err.message });
        return;
      }
      logger.info(`Blog post created successfully with ID: ${id}`);
      res.status(201).json({ id: id });
    }
  );
};

export const updatePost = (req, res) => {
  const { title, description, content } = req.body;
  const id = req.params.id;
  db.run('UPDATE blog_posts SET title = ?, description = ?, content = ? WHERE id = ?',
    [title, description, content, id],
    function(err) {
      if (err) {
        logger.error(`Failed to update blog post: ${err.message}`);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json({ changes: this.changes });
    }
  );
};

export const recoverPost = (req, res) => {
  const { id } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    logger.info(`Blog post recovered: ${id}`);
    res.json({ changes: this.changes });
  });
};

export const updatePostStatus = (req, res) => {
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
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const sql = `UPDATE blog_posts SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  params.push(id);

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
  const { id } = req.params;
  db.run('UPDATE blog_posts SET is_deleted = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    logger.info(`Blog post deleted: ${id}`);
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
  const id = req.params.id;
  db.get('SELECT id FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
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