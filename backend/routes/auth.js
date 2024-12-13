import express from 'express';
import * as authHandlers from '../handlers/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', authHandlers.register);
router.post('/login', authHandlers.login);
router.post('/logout', authHandlers.logout);
router.put('/password', authenticateToken, authHandlers.updatePassword);
router.get('/check', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true });
});
router.get('/getUsername', authenticateToken, authHandlers.getUsername);

export default router;