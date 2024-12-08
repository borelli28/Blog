import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';

export const getUsernameFromToken = (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject('Authentication required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject('Invalid or expired token');
      }

      const userId = decoded.userId;

      db.get('SELECT username FROM users WHERE id = ?', [userId], (dbErr, row) => {
        if (dbErr) {
          return reject('Database error fetching username');
        }
        if (!row) {
          return reject('User not found');
        }
        resolve(row.username);
      });
    });
  });
};