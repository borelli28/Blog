import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenValid } from '../utils/tokenWhitelist';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Check if token is in whitelist
    if (!isTokenValid(token)) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};