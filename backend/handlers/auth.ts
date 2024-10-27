import { Request, Response } from 'express';
import { db } from '../models/db';
import bcrypt from 'bcrypt';
import { userRegisterValidator, userLoginValidator, passphraseValidator } from '../utils/validators';

export const register = async (req: Request, res: Response) => {
  const errors = await userRegisterValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const { username, passphrase } = req.body;
  const hashedPassphrase = await bcrypt.hash(passphrase, 10);

  db.run('INSERT INTO users (username, passphrase) VALUES (?, ?)', [username, hashedPassphrase], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
};

export const login = async (req: Request, res: Response) => {
  const errors = await userLoginValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const { username, passphrase } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or passphrase' });
    }
    const match = await bcrypt.compare(passphrase, user.passphrase);
    if (match) {
      // Create JWT token
      //
      res.json({ message: 'Logged in successfully' });
    } else {
      res.status(400).json({ error: 'Invalid username or passphrase' });
    }
  });
};

export const logout = (req: Request, res: Response) => {
  // Invalidate auth JWT token
  //
  res.json({ message: 'Logged out successfully' });
};

export const updatePassphrase = async (req: Request, res: Response) => {
  const errors = passphraseValidator(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const { username, newPassphrase } = req.body;
  const hashedPassphrase = await bcrypt.hash(newPassphrase, 10);

  db.run('UPDATE users SET passphrase = ? WHERE username = ?', [hashedPassphrase, username], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
};