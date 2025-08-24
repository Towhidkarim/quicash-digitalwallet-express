import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { UserController } from './user.controller';
import { authenticateRoles } from '../../utils/authenticateRoles';

export const userRouter = Router();

userRouter.get(
  '/get-all',
  authenticate,
  authenticateRoles(['admin']),
  UserController.getAllUsers
);
userRouter.get('/me', authenticate, UserController.getMe);
userRouter.get('/id/:id', authenticate, UserController.getUserById);
userRouter.get(
  '/phone-number/:phoneNumber',
  authenticate,
  UserController.getUserByPhoneNumber
);
userRouter.patch(
  '/change-password',
  authenticate,
  UserController.updatePassword
);

userRouter.patch('/update/:id', authenticate, UserController.updateUser);
userRouter.patch(
  '/set-account-status',
  authenticate,
  authenticateRoles(['admin']),
  UserController.setAccountStatus
);
userRouter.patch(
  '/set-user-role',
  authenticate,
  authenticateRoles(['admin']),
  UserController.setUserRole
);
