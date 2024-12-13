import express from 'express';
import * as logHandlers from '../handlers/logs';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, logHandlers.getLogs);
router.delete('/:timestamp', authenticateToken, logHandlers.removeLog); 

export default router;