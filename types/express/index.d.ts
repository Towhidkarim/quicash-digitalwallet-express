// types/express/index.d.ts

import { TRequestUser } from '../../src/modules/auth/auth.schema';

declare global {
  namespace Express {
    interface Request {
      user?: TRequestUser;
    }
  }
}
