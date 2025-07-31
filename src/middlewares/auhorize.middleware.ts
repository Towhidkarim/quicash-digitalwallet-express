import { Request, Response, NextFunction } from 'express';
import { TRoles } from '../config/roles';
import { status } from 'http-status';

export const authorize =
  (requiredPermission: TRoles[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!requiredPermission.includes(user.role)) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
