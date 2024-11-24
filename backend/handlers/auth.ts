import { Request, Response } from 'express';
import { db } from '../models/db';
import bcrypt from 'bcrypt';
import { userRegisterValidator, userLoginValidator, passwordValidator } from '../utils/validators';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { addToken, removeToken, isTokenValid } from '../utils/tokenWhitelist';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response) => {
  try {
    const errors = await userRegisterValidator(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        logger.error(`Error registering new user: ${err.message}`);
        return res.status(500).json({ error: err.message });
      }
      logger.info(`New user registered: ${username}`);
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    logger.error(`Unexpected error during user registration: ${error}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = await userLoginValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      logger.error(`Database error during login: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${username}`);
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Add token to whitelist
      addToken(token);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      logger.info(`User logged in: ${username}`);
      res.json({ 
        message: 'Logged in successfully', 
        userId: user.id
      });
    } else {
      logger.warn(`Failed login attempt for user: ${username}`);
      res.status(400).json({ error: 'Invalid username or password' });
    }
  });
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn('Authentication attempt with no token');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      logger.warn(`Failed token authentication: ${err.message}`);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

export const logout = (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (token) {
    removeToken(token);  // Remove token from whitelist

    res.clearCookie('token', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
  }

  logger.info(`User logged out: ${req.user?.username}`);
  res.json({ message: 'Logged out successfully' });
};

export const updatePassword = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const errors = passwordValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      function (err) {
        if (err) {
          logger.error(`Error updating password for user ${username}: ${err.message}`);
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          logger.warn(`No user found with username: ${username}`);
          return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`Password updated for user: ${username}`);
        res.json({ changes: this.changes });
      }
    );
  } catch (error) {
    logger.error(`Unexpected error updating password for user ${username}: ${error}`);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};


export const getUsername = (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn('Attempt to fetch username without token');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      logger.warn(`Token verification failed: ${err.message}`);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded.userId;
    db.get('SELECT username FROM users WHERE id = ?', [userId], (dbErr, row) => {
      if (dbErr) {
        logger.error(`Database error fetching username: ${dbErr.message}`);
        return res.status(500).json({ error: 'Failed to retrieve username' });
      }
      if (!row) {
        logger.warn(`User not found for ID: ${userId}`);
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ username: row.username });
    });
  });
};