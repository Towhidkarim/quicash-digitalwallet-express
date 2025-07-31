import { Router } from 'express';
import { AuthController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/sign-up', AuthController.signUp);
authRouter.post('/create-super-user', AuthController.createSuperUser);
authRouter.post('/sign-in', AuthController.signIn);
authRouter.post('/refresh', AuthController.refresh);
