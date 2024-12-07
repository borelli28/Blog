import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export const initializeSchema = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      article_img TEXT,
      description TEXT,
      content TEXT,
      author_id INTEGER,
      is_favorite BOOLEAN DEFAULT 0,
      is_public BOOLEAN DEFAULT 0,
      is_deleted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      description TEXT,
      blog_id TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blog_id) REFERENCES blog_posts(id)
    )`);
  });
};


export const createBlogPost = (title, articleImg, description, content, authorId, isFavorite = false, isPublic = false) => {
  const id = uuidv4();
  db.run(`INSERT INTO blog_posts (id, title, article_img, description, content, author_id, is_favorite, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [id, title, articleImg, description, content, authorId, isFavorite, isPublic], 
    (err) => {
      if (err) {
        console.error('Error inserting blog post:', err.message);
      } else {
        console.log('Blog post created successfully with ID:', id);
      }
    });
};