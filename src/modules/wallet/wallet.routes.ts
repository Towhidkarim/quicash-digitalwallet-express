import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { WalletController } from './wallet.controller';
import { authenticateRoles } from '../../utils/authenticateRoles';

export const walletRouter = Router();

walletRouter.get(
  '/by-user-id/:id',
  authenticate,
  WalletController.getWalletById
);
walletRouter.get(
  '/by-user-phone-number/:phoneNumber',
  authenticate,
  WalletController.getWalletByPhoneNumber
);
walletRouter.get(
  '/get-all',
  authenticate,
  authenticateRoles(['admin']),
  WalletController.getAllWallets
);
walletRouter.patch(
  '/set-wallet-status',
  authenticate,
  authenticateRoles(['admin']),
  WalletController.setWalletStatus
);
