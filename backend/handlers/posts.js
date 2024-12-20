import { db } from '../models/db.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';
import fs from 'fs';
import path from 'path';

// Removes all characters except alphanumeric, hyphens, and spaces
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[^a-zA-Z0-9\s-]/g, '');
};

// Sanitizes HTML content and preserves markdown image syntax
const sanitizeHtmlContent = (input) => {
  if (typeof input !== 'string') return '';

  const allowedTags = ['div', 'p', 'li', 'ul', 'ol', 'span', 'br', 'b', 'i', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img'];
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  // Preserve markdown image syntax
  const preserveMarkdownImage = input.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    return match.replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;');
  });

  // Sanitize HTML tags
  const sanitizedHtml = preserveMarkdownImage.replace(tagPattern, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      // For allowed tags, strip attributes except src, alt, and href
      if (tag.toLowerCase() === 'img' || tag.toLowerCase() === 'a') {
        return match.replace(/(\w+)\s*=\s*"[^"]*"/g, (attrMatch, attrName) => {
          if (['src', 'alt', 'href'].includes(attrName.toLowerCase())) {
            return attrMatch;
          }
          return '';
        });
      }
      return match;
    }
    return '';
  });

  return sanitizedHtml;
};

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
      logger.error('Failed to get all blog posts', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('All blog posts retrieved', 'All blog posts retrieved', { 
      username: req.username, blog_count: rows.length 
    });
    res.json(rows);
  });
}];

export const getPubPost = [getUsername, (req, res) => {
  const id = sanitizeInput(req.params.id);
  db.get('SELECT * FROM blog_posts WHERE id = ? AND is_deleted = 0 AND is_public = 1', [id], (err, row) => {
    if (err) {
      logger.error('Failed to get blog post', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      logger.infoWithMeta('Blog post not found', 'Blog post not found', {
        blog_id: id,
        username: req.username
      });
      return res.status(404).json({ error: 'Post not found' });
    }

    logger.infoWithMeta('Blog post retrieved', 'Blog post retrieved', {
      blog_id: id,
      blog_title: row.title,
      username: req.username
    });

    res.json(row);
  });
}];

export const getPost = [getUsername, (req, res) => {
  const id = sanitizeInput(req.params.id);
  db.get('SELECT * FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
    if (err) {
      logger.error('Failed to get blog post', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      logger.infoWithMeta('Blog post not found', 'Blog post not found', {
        blog_id: id,
        username: req.username
      });
      return res.status(404).json({ error: 'Post not found' });
    }

    logger.infoWithMeta('Blog post retrieved', 'Blog post retrieved', {
      blog_id: id,
      blog_title: row.title,
      username: req.username
    });

    res.json(row);
  });
}];

export const createPost = [getUsername, (req, res) => {
  const sanitizedBody = {
    title: sanitizeInput(req.body.title),
    description: sanitizeInput(req.body.description),
    content: sanitizeHtmlContent(req.body.content),
    author_id: sanitizeInput(req.body.author_id)
  };
  const { title, description, content, author_id } = sanitizedBody;
  const id = uuidv4();

  db.run('INSERT INTO blog_posts (id, title, description, content, author_id) VALUES (?, ?, ?, ?, ?)',
    [id, title, description, content, author_id],
    function (err) {
      if (err) {
        logger.error('Failed to create blog post', {
          error: err.message,
          stack: err.stack,
          username: req.username,
          postTitle: title,
        });
        return res.status(500).json({ error: err.message });
      }
      logger.infoWithMeta('Blog post created', 'Blog post created', { 
        username: req.username,
        blog_id: id,
        blog_title: title
      });
      res.status(201).json({ id: id });
    }
  );
}];

export const updatePost = [getUsername, (req, res) => {
  const sanitizedBody = {
    title: sanitizeInput(req.body.title),
    description: sanitizeInput(req.body.description),
    content: sanitizeHtmlContent(req.body.content)
  };
  const { title, description, content } = sanitizedBody;
  const id = sanitizeInput(req.params.id);

  db.run('UPDATE blog_posts SET title = ?, description = ?, content = ? WHERE id = ?',
    [title, description, content, id],
    function (err) {
      if (err) {
        logger.error('Failed to update blog post', {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        logger.infoWithMeta('Blog post not found for update', 'Blog post not found for update', { 
          username: req.username,
          blog_id: id,
          blog_title: title,
        });
        return res.status(404).json({ message: 'Post not found' });
      }
      logger.infoWithMeta('Blog post updated', 'Blog post updated', { 
          username: req.username,
          blog_id: id,
          blog_title: title,
      });
      res.json({ changes: this.changes });
    }
  );
}];

export const recoverPost = [getUsername, (req, res) => {
  const id = sanitizeInput(req.params.id);
  db.run('UPDATE blog_posts SET is_deleted = 0 WHERE id = ?', [id], function (err) {
    if (err) {
      logger.error('Failed to recover blog post', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Blog post recovered', 'Blog post recovered', { 
      username: req.username,
      blog_id: id
    });
    res.json({ changes: this.changes });
  });
}];

export const updatePostStatus = [getUsername, (req, res) => {
  const sanitizedBody = {
    is_favorite: sanitizeInput(req.body.is_favorite),
    is_public: sanitizeInput(req.body.is_public)
  };
  const { is_favorite, is_public } = sanitizedBody;
  const id = sanitizeInput(req.params.id);

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
    logger.infoWithMeta('No valid fields to update', 'No valid fields to update', { 
      username: req.username,
      blog_id: id
    });
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const sql = `UPDATE blog_posts SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      logger.error('Failed to update blog post status', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      logger.infoWithMeta('Blog post not found for status update', 'Blog post not found for status update', { 
        username: req.username, 
        blog_id: id
      });
      return res.status(404).json({ error: 'Post not found' });
    }
    logger.infoWithMeta('Blog post status updated', 'Blog post status updated', { 
      username: req.username,
      blog_id: id
    });
    res.json({ changes: this.changes });
  });
}];

export const deletePost = [getUsername, (req, res) => {
  const id = sanitizeInput(req.params.id);

  db.run('UPDATE blog_posts SET is_deleted = 1 WHERE id = ?', [id], function (err) {
    if (err) {
      logger.error('Failed to delete blog post', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Blog post deleted', 'Blog post deleted', { 
      username: req.username,
      blog_id: id
    });
    res.json({ changes: this.changes });
  });
}];

export const permanentDeletePost = [getUsername, (req, res) => {
  const id = sanitizeInput(req.body.id);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Delete associated images from the filesystem
    db.all('SELECT image FROM images WHERE blog_id = ?', [id], (err, rows) => {
      if (err) {
        db.run('ROLLBACK');
        logger.error('Failed to fetch images for deletion', {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: 'Internal server error' });
      }

      rows.forEach(row => {
        const imagePath = path.join(__dirname, '..', 'uploads', row.image);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) {
            logger.error('Failed to delete image file', {
              error: unlinkErr.message,
              stack: unlinkErr.stack,
              username: req.username,
              imagePath: imagePath,
            });
          }
        });
      });
    });

    // Delete images from the database
    db.run('DELETE FROM images WHERE blog_id = ?', [id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        logger.error('Failed to delete associated images from database', {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Delete the blog post
    db.run('DELETE FROM blog_posts WHERE id = ?', [id], function (err) {
      if (err) {
        db.run('ROLLBACK');
        logger.error('Failed to permanently delete blog post', {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: 'Internal server error' });
      }

      db.run('COMMIT');
      logger.infoWithMeta('Blog post permanently deleted', 'Blog post permanently deleted', { 
        username: req.username,
        blog_id: id
      });
      res.json({ changes: this.changes });
    });
  });
}];

export const getPostImages = [getUsername, (req, res) => {
  const id = sanitizeInput(req.params.id);
  db.get('SELECT id FROM blog_posts WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
    if (err) {
      logger.error('Failed to get post for images', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      logger.infoWithMeta('Post not found for image retrieval', 'Post not found for image retrieval', { 
        username: req.username,
        blog_id: id
      });
      return res.status(404).json({ error: 'Post not found' });
    }

    db.all('SELECT * FROM images WHERE blog_id = ?', [row.id], (err, images) => {
      if (err) {
        logger.error('Failed to get images for post', {
          error: err.message,
          stack: err.stack,
          username: req.username,
        });
        return res.status(500).json({ error: err.message });
      }
      logger.infoWithMeta('Post images retrieved', 'Post images retrieved', { 
        username: req.username,
        blog_id: id,
        blog_title: row.title,
        images_count: images.length
      });
      res.json(images);
    });
  });
}];

export const getFeaturedPosts = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_favorite = 1 AND is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error('Failed to get featured posts', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Featured posts retrieved', 'Featured posts retrieved', { 
      username: req.username,
      blog_count: rows.length
    });
    res.json(rows);
  });
}];

export const getPublishedPosts = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts WHERE is_public = 1 AND is_deleted = 0 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error('Failed to get published posts', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Published posts retrieved', 'Published posts retrieved', { 
      username: req.username,
      blog_count: rows.length
    });
    res.json(rows);
  });
}];

export const getAllPostsIncludingDeleted = [getUsername, (req, res) => {
  db.all('SELECT * FROM blog_posts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      logger.error('Failed to get all posts including deleted', {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('All posts including deleted retrieved', 'All posts including deleted retrieved', {
      username: req.username,
      blog_count: rows.length
    });
    res.json(rows);
  });
}];