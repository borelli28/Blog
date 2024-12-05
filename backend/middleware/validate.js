import { body, validationResult } from 'express-validator';

export const validateBlogPost = [
  body('title').notEmpty().trim().escape(),
  body('content').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];