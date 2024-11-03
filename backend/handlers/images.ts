import { Request, Response } from 'express';
import { db } from '../models/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

export const uploadArticleImage = (req: Request, res: Response) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
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
            console.error('Database error:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          const imageId = this.lastID;

          // Update the blog_posts table with the new article_img
          db.run('UPDATE blog_posts SET article_img = ? WHERE id = ?',
            [file.filename, blog_id],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              res.status(201).json({ id: imageId, filename: file.filename });
            }
          );
        }
      );
    });
  });
};

export const uploadImage = (req: Request, res: Response) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
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
          console.error('Database error:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, filename: file.filename });
      }
    );
  });
};

export const updateAltValues = (req: Request, res: Response) => {
  const { id, description } = req.body;
  db.run('UPDATE images SET description = ? WHERE id = ?', [description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
};

export const deleteImage = (req: Request, res: Response) => {
  const { id } = req.body;

  // Get the image filename from DB
  db.get('SELECT image FROM images WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filename = row.image;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    // Delete the file from the filesystem
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
        // Continue with DB deletion even if file deletion fails
      }

      // Delete the image record from DB
      db.run('DELETE FROM images WHERE id = ?', [id], function(deleteErr) {
        if (deleteErr) {
          return res.status(500).json({ error: deleteErr.message });
        }

        // If this is an article image, update the blog_posts table
        db.run('UPDATE blog_posts SET article_img = NULL WHERE article_img = ?', [filename], function(updateErr) {
          if (updateErr) {
            console.error('Error updating blog_posts:', updateErr);
          }

          res.json({ 
            message: 'Image deleted successfully', 
            changes: this.changes,
            fileDeleted: !unlinkErr
          });
        });
      });
    });
  });
};