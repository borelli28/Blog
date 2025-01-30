import { addToken, removeToken, isTokenValid } from '../utils/tokenWhitelist.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isTokenValid(token)) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!isTokenValid(token)) {
    logger.infoWithMeta('Authentication failed', 'Token not in whitelist');
    return res.status(401).json({ error: 'Invalid or expired token' });
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

export const refreshToken = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!isTokenValid(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const newToken = jwt.sign(
      { userId: user.userId, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    removeToken(token);
    addToken(newToken);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    res.json({ message: 'Token refreshed successfully' });
  });
};