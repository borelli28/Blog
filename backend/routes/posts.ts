import express from 'express';
import * as postHandlers from '../handlers/posts';
import { authenticateToken } from '../handlers/auth';

const router = express.Router();

router.get('/', postHandlers.getAllPosts);
router.get('/all', authenticateToken, postHandlers.getAllPostsIncludingDeleted);
router.get('/featured', postHandlers.getFeaturedPosts);
router.get('/published', postHandlers.getPublishedPosts);
router.delete('/permanent', authenticateToken, postHandlers.permanentDeletePost);
router.get('/:title', postHandlers.getPost);
router.post('/', authenticateToken, postHandlers.createPost);
router.put('/:title', authenticateToken, postHandlers.updatePost);
router.patch('/:title/recover', authenticateToken, postHandlers.recoverPost);
router.patch('/:title/status', authenticateToken, postHandlers.updatePostStatus);
router.delete('/:title', authenticateToken, postHandlers.deletePost);
router.get('/:title/images', postHandlers.getPostImages);

export default router;