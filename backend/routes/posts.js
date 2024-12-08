import express from 'express';
import * as postHandlers from '../handlers/posts';
import { authenticateToken } from '../handlers/auth';

const router = express.Router();

router.get('/', postHandlers.getAllPosts);
router.get('/all', authenticateToken, postHandlers.getAllPostsIncludingDeleted);
router.get('/featured', postHandlers.getFeaturedPosts);
router.get('/published', postHandlers.getPublishedPosts);
router.delete('/permanent', authenticateToken, postHandlers.permanentDeletePost);
router.get('/:id', postHandlers.getPost);
router.post('/', authenticateToken, postHandlers.createPost);
router.put('/:id', authenticateToken, postHandlers.updatePost);
router.patch('/:id/recover', authenticateToken, postHandlers.recoverPost);
router.patch('/:id/status', authenticateToken, postHandlers.updatePostStatus);
router.delete('/:id', authenticateToken, postHandlers.deletePost);
router.get('/:id/images', postHandlers.getPostImages);

export default router;