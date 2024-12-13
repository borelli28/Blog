import express from 'express';
import * as imageHandlers from '../handlers/images';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/upload-article', authenticateToken, imageHandlers.uploadArticleImage);
router.post('/upload', authenticateToken, imageHandlers.uploadImage);
router.delete('/', authenticateToken, imageHandlers.deleteImage);
router.put('/alt', authenticateToken, imageHandlers.updateAltValues);

export default router;