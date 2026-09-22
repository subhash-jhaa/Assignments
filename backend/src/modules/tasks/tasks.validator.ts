import { body, param, query } from 'express-validator';

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
    .customSanitizer((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED.'),
];

export const updateTaskValidator = [
  param('id')
    .notEmpty().withMessage('Task ID is required.')
    .isUUID().withMessage('Task ID must be a valid UUID.'),

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
    .customSanitizer((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status must be PENDING or COMPLETED.'),
];

export const taskIdValidator = [
  param('id')
    .notEmpty().withMessage('Task ID is required.')
    .isUUID().withMessage('Task ID must be a valid UUID.'),
];

export const taskQueryValidator = [
  query('status')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .isIn(['PENDING', 'COMPLETED']).withMessage('Status filter must be PENDING or COMPLETED.'),
];

