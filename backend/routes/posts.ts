import express from 'express';
import * as postHandlers from '../handlers/posts';

const router = express.Router();

router.get('/', postHandlers.getAllPosts);
router.get('/:title', postHandlers.getPost);
router.post('/', postHandlers.createPost);
router.put('/:title', postHandlers.updatePost);
router.delete('/', postHandlers.deletePost);
router.delete('/permanent', postHandlers.permanentDeletePost);

export default router;