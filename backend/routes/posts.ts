import express from 'express';
import * as postHandlers from '../handlers/posts';
import { authenticateToken } from '../handlers/auth';

const router = express.Router();

router.get('/', postHandlers.getAllPosts);
router.get('/:title', postHandlers.getPost);
router.post('/', authenticateToken, postHandlers.createPost);
router.put('/:title', authenticateToken, postHandlers.updatePost);
router.delete('/', authenticateToken, postHandlers.deletePost);
router.delete('/permanent', authenticateToken, postHandlers.permanentDeletePost);

export default router;