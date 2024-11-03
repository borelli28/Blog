import { Request, Response } from 'express';
import { db } from '../models/db';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

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

export const deleteImage = (req: Request, res: Response) => {
  const { id } = req.body;
  db.run('DELETE FROM images WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
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