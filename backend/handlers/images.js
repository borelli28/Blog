import { db } from '../models/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';
import { processUploadedImage } from '../utils/imageProcessor.js';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[^a-zA-Z0-9-]/g, ''); // Remove all characters except alphanumeric and hyphens
};

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

class InvalidFileTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidFileTypeError';
  }
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpg','image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new InvalidFileTypeError('Invalid file type. Only JPG, JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const getUsername = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    req.username = await getUsernameFromToken(token);
  } catch (error) {
    req.username = 'anonymous';
  }
  next();
};

export const uploadArticleImage = [getUsername, (req, res) => {
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(`Failed to upload article image`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    } else if (err) {
      if (err instanceof InvalidFileTypeError) {
        logger.warn(`Attempted upload of invalid file type for image`, {
          username: req.username,
          originalname: req.file ? req.file.originalname : 'unknown',
          mimetype: req.file ? req.file.mimetype : 'unknown'
        });
        return res.status(400).json({ error: err.message });
      }
      logger.error(`Failed to upload article image`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }

    const file = await processUploadedImage(req.file);  // Remove img metadata among other things...
    if (!file) {
      logger.infoWithMeta('Article image upload failed', 'No file uploaded', { username: req.username });
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const sanitizedBody = {
      description: sanitizeInput(req.body.description),
      blog_id: sanitizeInput(req.body.blog_id)
    };

    const { description, blog_id } = sanitizedBody;
    if (!description || !blog_id) {
      logger.infoWithMeta('Article image upload failed', 'Missing description or blog_id', { username: req.username });
      return res.status(400).json({ error: 'Missing description or blog_id' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run('INSERT INTO images (image, description, blog_id) VALUES (?, ?, ?)',
        [file.filename, description, blog_id],
        function(err) {
          if (err) {
            logger.error(`Failed to insert article image`, {
              error: err.message,
              stack: err.stack,
              username: req.username,
            });
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          const imageId = this.lastID;

          db.run('UPDATE blog_posts SET article_img = ? WHERE id = ?',
            [file.filename, blog_id],
            function(err) {
              if (err) {
                logger.error(`Failed to update blog post with article image`, {
                  error: err.message,
                  stack: err.stack,
                  username: req.username,
                });
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              logger.infoWithMeta('Article image uploaded', 'Article image uploaded', {
                username: req.username,
                filename: file.filename,
                image_id: imageId,
                blog_id: blog_id
              });
              res.status(201).json({ id: imageId, filename: file.filename });
            }
          );
        }
      );
    });
  });
}];

export const uploadImage = [getUsername, (req, res) => {
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(`Failed to upload image`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    } else if (err) {
      if (err instanceof InvalidFileTypeError) {
        logger.warn(`Attempted upload of invalid file type for image`, {
          username: req.username,
          originalname: req.file ? req.file.originalname : 'unknown',
          mimetype: req.file ? req.file.mimetype : 'unknown'
        });
        return res.status(400).json({ error: err.message });
      }
      logger.error(`Failed to upload image`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }

    const file = await processUploadedImage(req.file);  // Remove img metadata among other things...
    if (!file) {
      logger.infoWithMeta('Image upload failed', 'No file uploaded', { username: req.username });
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const sanitizedBody = {
      description: sanitizeInput(req.body.description),
      blog_id: sanitizeInput(req.body.blog_id)
    };

    const { description, blog_id } = sanitizedBody;
    if (!description || !blog_id) {
      logger.infoWithMeta('Image upload failed', 'Missing description or blog_id', { username: req.username });
      return res.status(400).json({ error: 'Missing description or blog_id' });
    }

    db.run('INSERT INTO images (image, description, blog_id) VALUES (?, ?, ?)',
      [file.filename, description, blog_id],
      function(err) {
        if (err) {
          logger.error(`Failed to insert image`, {
            error: err.message,
            stack: err.stack,
            username: req.username,
          });
          return res.status(500).json({ error: err.message });
        }
        logger.infoWithMeta('Image uploaded', 'Image uploaded', {
          username: req.username,
          image_id: this.lastID,
          filename: file.filename,
          blog_id: blog_id
        });
        res.status(201).json({ id: this.lastID, filename: file.filename });
      }
    );
  });
}];

export const updateAltValues = [getUsername, (req, res) => {
    const sanitizedBody = {
      description: sanitizeInput(req.body.description),
      id: sanitizeInput(req.body.id)
    };
  const { id, description } = sanitizedBody;

  db.run('UPDATE images SET description = ? WHERE id = ?', [description, id], function(err) {
    if (err) {
      logger.error(`Failed to update image alt text`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    logger.infoWithMeta('Image alt text updated', 'Image alt text updated', {
      username: req.username,
      image_id: id
    });
    res.json({ changes: this.changes });
  });
}];

export const deleteImage = [getUsername, (req, res) => {
  const sanitizedBody = {
    id: sanitizeInput(req.body.id)
  };
  const { id } = sanitizedBody;

  db.get('SELECT image FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      logger.error(`Failed to fetch image for deletion`, {
        error: err.message,
        stack: err.stack,
        username: req.username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      logger.infoWithMeta('Image not found for deletion', 'Image not found for deletion', {
        username: req.username,
        image_id: id
      });
      return res.status(404).json({ error: 'Image not found' });
    }

    const filename = row.image;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        logger.error(`Failed to delete file from filesystem`, {
          error: unlinkErr.message,
          stack: unlinkErr.stack,
          username: req.username,
        });
      }

      db.run('DELETE FROM images WHERE id = ?', [id], function(deleteErr) {
        if (deleteErr) {
          logger.error(`Failed to delete image from database`, {
            error: deleteErr.message,
            stack: deleteErr.stack,
            username: req.username,
          });
          return res.status(500).json({ error: deleteErr.message });
        }

        db.run('UPDATE blog_posts SET article_img = NULL WHERE article_img = ?', [filename], function(updateErr) {
          if (updateErr) {
            logger.error(`Failed to update blog posts after image deletion`, {
              error: updateErr.message,
              stack: updateErr.stack,
              username: req.username,
            });
          }

          logger.infoWithMeta('Image deleted', 'Image deleted', { 
            username: req.username,
            image_id: id,
            filename: filename,
            file_deleted: !unlinkErr
          });
          res.json({ 
            message: 'Image deleted successfully', 
            changes: this.changes,
            file_deleted: !unlinkErr
          });
        });
      });
    });
  });
}];