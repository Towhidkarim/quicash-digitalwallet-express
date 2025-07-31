import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';

export const transactionRouter = Router();

transactionRouter.get(
  '/by-user-id/:userId',
  authenticate,
  TransactionController.getTransactionsByUserId
);
transactionRouter.get(
  '/:id',
  authenticate,
  TransactionController.getTransactionById
);
// transactionRouter.post('/cash-in', TransactionController.cashIn);
// transactionRouter.post('/cash-out', TransactionController.cashOut);
transactionRouter.post(
  '/send-money',
  authenticate,
  TransactionController.sendMoney
);
