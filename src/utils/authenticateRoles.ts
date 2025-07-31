import { Request, Response, NextFunction } from 'express';
import { TRoles } from '../config/roles';

export function authenticateRoles(allowedRoles: TRoles[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No user role found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role.' });
    }

    next();
  };
}
