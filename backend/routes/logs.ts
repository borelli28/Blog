import express from 'express';
import * as logHandlers from '../handlers/logs';
import { authenticateToken } from '../handlers/auth';

const router = express.Router();

router.get('/', authenticateToken, logHandlers.getLogs);

export default router;