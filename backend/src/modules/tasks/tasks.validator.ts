import { body } from 'express-validator';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters.'),

  body('status')
    .optional()
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED.'),
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters.'),

  body('status')
    .optional()
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED.'),
];
