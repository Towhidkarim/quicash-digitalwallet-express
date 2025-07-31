import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/user/user.routes';
import { walletRouter } from '../modules/wallet/wallet.routes';
import { transactionRouter } from '../modules/transaction/transaction.routes';

export const versionOneRouter = Router();

const routes = [
  { path: '/auth', router: authRouter },
  { path: '/user', router: userRouter },
  { path: '/wallet', router: walletRouter },
  { path: '/transaction', router: transactionRouter },
];

routes.forEach((element) => {
  versionOneRouter.use(element.path, element.router);
});
