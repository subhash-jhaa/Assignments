import { param } from 'express-validator';

export const userIdValidator = [
  param('id')
    .notEmpty().withMessage('User ID is required.')
    .isUUID().withMessage('User ID must be a valid UUID.'),
];
