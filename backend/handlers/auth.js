import { db } from '../models/db.js';
import bcrypt from 'bcrypt';
import { userRegisterValidator, userLoginValidator, passwordValidator } from '../utils/validators.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { addToken, removeToken, isTokenValid } from '../utils/tokenWhitelist.js';
import { getUsernameFromToken } from '../utils/getUsernameFromToken.js';
import { authenticateToken } from '../middleware/auth.js';
import { refreshToken as refreshTokenMiddleware } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[^a-zA-Z0-9-]/g, ''); // Remove all characters except alphanumeric and hyphens
};

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

    const sanitizedBody = {
      username: sanitizeInput(req.body.username),
      password: req.body.password
    };

    const { username, password } = sanitizedBody;
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
      logger.infoWithMeta('User registered', 'User registered', {
        username: username,
        user_id: this.lastID
      });
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

  const sanitizedBody = {
    username: sanitizeInput(req.body.username),
    password: req.body.password
  };

  const { username, password } = sanitizedBody;
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

      logger.infoWithMeta('User logged in', 'User logged in', { username: username });
      res.json({ 
        message: 'Logged in successfully', 
        user_id: user.id
      });
    } else {
      logger.infoWithMeta('Login failed', 'Invalid password', { username: username });
      res.status(400).json({ error: 'Invalid username or password' });
    }
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

  logger.infoWithMeta('User logged out', 'User logged out', { username: username });
  res.json({ message: 'Logged out successfully' });
}];

export const updatePassword = async (req, res) => {
  const sanitizedBody = {
    username: sanitizeInput(req.body.username),
    password: req.body.password
  };
  const { username, password } = sanitizedBody;

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

        logger.infoWithMeta('Password updated', 'Password updated', {
          username: username
        });
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

  if (!isTokenValid(token)) {
    logger.infoWithMeta('Username fetch failed', 'Token not in whitelist');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.infoWithMeta('Username fetch failed', 'Invalid or expired token', { error: err.message });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded.userId;
    db.get('SELECT username FROM users WHERE id = ?', [userId], (dbErr, row) => {
      if (dbErr) {
        logger.error('Failed to fetch username', {
          error: dbErr.message,
          stack: dbErr.stack,
          userId,
        });
        return res.status(500).json({ error: 'Failed to retrieve username' });
      }
      if (!row) {
        logger.infoWithMeta('Username fetch failed', 'User not found', { user_id: userId });
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ username: row.username });
    });
  });
};

export const refreshToken = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      refreshTokenMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    // If the middleware didn't send a response, send one here
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
};