import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();

export const db = new sqlite.Database('./blog.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});