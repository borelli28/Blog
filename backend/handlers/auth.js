import { db } from '../models/db.js';
import bcrypt from 'bcrypt';
import { userRegisterValidator, userLoginValidator, passwordValidator } from '../utils/validators.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { addToken, removeToken, isTokenValid } from '../utils/tokenWhitelist.js';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';

const JWT_SECRET = process.env.JWT_SECRET;

const getUserUsername = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    req.username = await getUsernameFromToken(token);
  } catch (error) {
    req.username = 'anonymous';
  }
  next();
};

export const register = async (req, res) => {
  try {
    const errors = await userRegisterValidator(req.body);
    if (Object.keys(errors).length > 0) {
      logger.infoWithMeta('User registration failed', 'Validation errors', { errors });
      return res.status(400).json({ errors });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        logger.error(`Failed to register new user`, {
          error: err.message,
          stack: err.stack,
          username,
        });
        return res.status(500).json({ error: err.message });
      }
      logger.infoWithMeta('User registered', this.lastID, { username: username });
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    logger.error(`Unexpected error during user registration`, {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const login = async (req, res) => {
  const errors = await userLoginValidator(req.body);
  if (Object.keys(errors).length > 0) {
    logger.infoWithMeta('Login failed', 'Validation errors', { errors });
    return res.status(400).json({ errors });
  }

  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      logger.error(`Failed to login user`, {
        error: err.message,
        stack: err.stack,
        username,
      });
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      logger.infoWithMeta('Login failed', 'User not found', { username: username });
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      addToken(token);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      logger.infoWithMeta('User logged in', '', { username: username });
      res.json({ 
        message: 'Logged in successfully', 
        userId: user.id
      });
    } else {
      logger.infoWithMeta('Login failed', 'Invalid password', { username: username });
      res.status(400).json({ error: 'Invalid username or password' });
    }
  });
};

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    logger.infoWithMeta('Authentication failed', 'No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.infoWithMeta('Authentication failed', 'Invalid or expired token', { error: err.message });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

export const logout = [getUserUsername, (req, res) => {
  const token = req.cookies.token;
  const username = req.username;

  if (token) {
    removeToken(token);
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  logger.infoWithMeta('User logged out', '', { username: username });
  res.json({ message: 'Logged out successfully' });
}];

export const updatePassword = async (req, res) => {
  const { username, password } = req.body;

  if (!username || username.trim() === '') {
    logger.infoWithMeta('Password update failed', 'Username is required', { username: username });
    return res.status(400).json({ error: 'Username is required' });
  }

  const errors = passwordValidator(req.body);
  if (Object.keys(errors).length > 0) {
    logger.infoWithMeta('Password update failed', 'Validation errors', { errors });
    return res.status(400).json({ errors });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      function (err) {
        if (err) {
          logger.error(`Failed to update password`, {
            error: err.message,
            stack: err.stack,
            username,
          });
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          logger.infoWithMeta('Password update failed', 'User not found', { username });
          return res.status(404).json({ error: 'User not found' });
        }

        logger.infoWithMeta('Password updated', username);
        res.json({ changes: this.changes });
      }
    );
  } catch (error) {
    logger.error(`Unexpected error updating password`, {
      error: error.message,
      stack: error.stack,
      username,
    });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const getUsername = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    logger.infoWithMeta('Username fetch failed', 'No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.infoWithMeta('Username fetch failed', 'Invalid or expired token', { error: err.message });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded.userId;
    db.get('SELECT username FROM users WHERE id = ?', [userId], (dbErr, row) => {
      if (dbErr) {
        logger.error(`Failed to fetch username`, {
          error: dbErr.message,
          stack: dbErr.stack,
          userId,
        });
        return res.status(500).json({ error: 'Failed to retrieve username' });
      }
      if (!row) {
        logger.infoWithMeta('Username fetch failed', 'User not found', { userId });
        return res.status(404).json({ error: 'User not found' });
      }
      logger.infoWithMeta('Username fetched', row.username, { userId });
      res.json({ username: row.username });
    });
  });
};