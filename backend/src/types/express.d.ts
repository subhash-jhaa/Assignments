// Extend Express Request to include the authenticated user
// This file is auto-loaded by TypeScript due to typeRoots in tsconfig.json

import { JwtPayload } from '../utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
