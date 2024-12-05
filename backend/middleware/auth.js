import jwt from 'jsonwebtoken';
import { isTokenValid } from '../utils/tokenWhitelist.js';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isTokenValid(token)) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};