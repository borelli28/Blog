import { Request, Response } from 'express';
import { db } from '../models/db';
import bcrypt from 'bcrypt';
import { userRegisterValidator, userLoginValidator, passwordValidator } from '../utils/validators';

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
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
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
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Create JWT token
      //
      res.json({ message: 'Logged in successfully' });
    } else {
      res.status(400).json({ error: 'Invalid username or password' });
    }
  });
};

export const logout = (req: Request, res: Response) => {
  // Invalidate auth JWT token
  //
  res.json({ message: 'Logged out successfully' });
};

export const updatePassword = async (req: Request, res: Response) => {
  const errors = passwordValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const { username, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
};