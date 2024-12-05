import { db } from '../models/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

export const uploadArticleImage = (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(`Multer error during article image upload: ${err.message}`);
      return res.status(500).json({ error: err.message });
    } else if (err) {
      logger.error(`Error during article image upload: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const { description, blog_id } = req.body;
    if (!description || !blog_id) {
      return res.status(400).json({ error: 'Missing description or blog_id' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run('INSERT INTO images (image, description, blog_id) VALUES (?, ?, ?)',
        [file.filename, description, blog_id],
        function(err) {
          if (err) {
            logger.error(`Database error during article image upload: ${err.message}`);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          const imageId = this.lastID;

          db.run('UPDATE blog_posts SET article_img = ? WHERE id = ?',
            [file.filename, blog_id],
            function(err) {
              if (err) {
                logger.error(`Database error updating blog_posts during article image upload: ${err.message}`);
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              res.status(201).json({ id: imageId, filename: file.filename });
              logger.info(`Article image uploaded successfully: ${file.filename}`);
            }
          );
        }
      );
    });
  });
};

export const uploadImage = (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(`Multer error during image upload: ${err.message}`);
      return res.status(500).json({ error: err.message });
    } else if (err) {
      logger.error(`Error during image upload: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const { description, blog_id } = req.body;
    if (!description || !blog_id) {
      return res.status(400).json({ error: 'Missing description or blog_id' });
    }

    db.run('INSERT INTO images (image, description, blog_id) VALUES (?, ?, ?)',
      [file.filename, description, blog_id],
      function(err) {
        if (err) {
          logger.error(`Database error during image upload: ${err.message}`);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, filename: file.filename });
        logger.info(`Image uploaded successfully: ${file.filename}`);
      }
    );
  });
};

export const updateAltValues = (req, res) => {
  const { id, description } = req.body;
  db.run('UPDATE images SET description = ? WHERE id = ?', [description, id], function(err) {
    if (err) {
      logger.error(`Error updating image alt text: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
};

export const deleteImage = (req, res) => {
  const { id } = req.body;

  db.get('SELECT image FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      logger.error(`Database error while fetching image for deletion: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      logger.warn(`Attempt to delete non-existent image with id: ${id}`);
      return res.status(404).json({ error: 'Image not found' });
    }

    const filename = row.image;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        logger.error(`Error deleting file from filesystem: ${unlinkErr.message}`);
      }

      db.run('DELETE FROM images WHERE id = ?', [id], function(deleteErr) {
        if (deleteErr) {
          logger.error(`Database error while deleting image: ${deleteErr.message}`);
          return res.status(500).json({ error: deleteErr.message });
        }

        db.run('UPDATE blog_posts SET article_img = NULL WHERE article_img = ?', [filename], function(updateErr) {
          if (updateErr) {
            logger.error(`Error updating blog_posts after image deletion: ${updateErr.message}`);
          }

          res.json({ 
            message: 'Image deleted successfully', 
            changes: this.changes,
            fileDeleted: !unlinkErr
          });
          logger.info(`Image deleted successfully: ${filename}`);
        });
      });
    });
  });
};