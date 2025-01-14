import express from 'express';
import * as authHandlers from '../handlers/auth';
import { authenticateToken } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', registerLimiter, authHandlers.register);
router.post('/login', loginLimiter, authHandlers.login);
router.post('/logout', authHandlers.logout);
router.put('/password', authenticateToken, authHandlers.updatePassword);
router.get('/check', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true });
});
router.get('/getUsername', authenticateToken, authHandlers.getUsername);
router.post('/refreshToken', authenticateToken, authHandlers.refreshToken);

export default router;