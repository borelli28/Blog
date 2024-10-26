import express from 'express';
import * as imageHandlers from '../handlers/images';

const router = express.Router();

router.post('/upload', imageHandlers.uploadImage);
router.delete('/', imageHandlers.deleteImage);
router.put('/alt', imageHandlers.updateAltValues);

export default router;