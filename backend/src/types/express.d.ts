// Extend Express Request to include the authenticated user.
// IMPORTANT: No import/export statements — this must stay an ambient file
// so the global namespace augmentation works correctly.

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}
