import express from 'express';
import * as authHandlers from '../handlers/auth';
import { authenticateToken } from '../handlers/auth';

const router = express.Router();

router.post('/register', authHandlers.register);
router.post('/login', authHandlers.login);
router.post('/logout', authHandlers.logout);
router.put('/password', authenticateToken, authHandlers.updatePassword);

export default router;