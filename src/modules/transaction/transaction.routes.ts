import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authenticateRoles } from '../../utils/authenticateRoles';

export const transactionRouter = Router();

transactionRouter.get(
  '/by-user-id/:userId',
  authenticate,
  TransactionController.getTransactionsByUserId
);
transactionRouter.get(
  '/agent/commissions/:userId',
  authenticate,
  authenticateRoles(['admin', 'agent']),
  TransactionController.getAgentCommissionsById
);
transactionRouter.get(
  '/get-all',
  authenticate,
  authenticateRoles(['admin']),
  TransactionController.getAllTransactions
);
transactionRouter.get(
  '/:id',
  authenticate,
  TransactionController.getTransactionById
);
transactionRouter.post(
  '/cash-in',
  authenticate,
  authenticateRoles(['admin', 'agent']),
  TransactionController.cashIn
);
transactionRouter.post(
  '/cash-out',
  authenticate,
  authenticateRoles(['admin', 'user']),
  TransactionController.cashOut
);
transactionRouter.post(
  '/add-money-admin',
  authenticate,
  authenticateRoles(['admin']),
  TransactionController.addMoneyAdmin
);
transactionRouter.post(
  '/send-money',
  authenticate,
  TransactionController.sendMoney
);
