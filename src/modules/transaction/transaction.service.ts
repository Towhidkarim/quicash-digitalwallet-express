import { TRequestUser } from '../auth/auth.schema';
import { UserModel } from '../user/user.model';
import { WalletModel } from '../wallet/wallet.model';
import { status } from 'http-status';
import { ApiError } from '../../utils/apiError';
import { COMISSIONS } from '../../config/comissions';
import { TransactionModel } from './transaction.model';
import { startSession as startMongooseSession } from 'mongoose';
import { sendResponse } from '../../utils/sendResponse';
import { success } from 'zod';

export const commitMoneyTransaction = async ({
  user,
  recipientPhoneNumber,
  amount,
  transactionType,
  commission,
}: {
  user: TRequestUser;
  recipientPhoneNumber: string;
  amount: number;
  transactionType: 'cashIn' | 'cashOut' | 'sendMoney' | 'addMoneyAdmin';
  commission: number;
}) => {
  const session = await startMongooseSession();
  let transactionStarted = false;
  try {
    const recipient = await UserModel.findOne(
      { phoneNumber: recipientPhoneNumber },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        phoneNumber: 1,
        role: 1,
      }
    );
    const initiator = await UserModel.findById(user._id, {
      _id: 1,
      firstName: 1,
      lastName: 1,
      phoneNumber: 1,
      role: 1,
    });
    if (transactionType === 'cashIn' && initiator?.role !== 'agent')
      throw new ApiError(status.UNAUTHORIZED, 'Only agents can cash in');
    if (
      transactionType === 'cashOut' &&
      initiator?.role !== 'user' &&
      recipient?.role !== 'agent'
    )
      throw new ApiError(
        status.UNAUTHORIZED,
        'Recipient must an agent for cash out'
      );
    if (transactionType === 'addMoneyAdmin' && initiator?.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'Only admins can directly add money'
      );

    const initiatorWallet = await WalletModel.findOne({
      walletOwnerId: user._id,
    });
    if (!recipient || !initiator || !initiatorWallet) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }
    // console.log(initiator.phoneNumber, recipient.phoneNumber);
    if (
      initiator.phoneNumber === recipient.phoneNumber &&
      transactionType !== 'addMoneyAdmin'
    )
      throw new ApiError(
        status.BAD_REQUEST,
        'You cannot send money to yourself'
      );

    if (amount <= 0 && transactionType !== 'addMoneyAdmin')
      throw new ApiError(status.BAD_REQUEST, 'Amount must be greater than 0');

    if (
      initiatorWallet.balance < amount + amount * commission &&
      transactionType !== 'addMoneyAdmin'
    )
      throw new ApiError(status.BAD_REQUEST, 'Insufficient balance');

    session.startTransaction();
    transactionStarted = true;

    const transaction = await TransactionModel.create(
      [
        {
          initiatorId: initiator._id,
          recipientId: recipient._id,
          initiatorName: initiator.firstName + ' ' + initiator.lastName,
          recipientName: recipient.firstName + ' ' + recipient.lastName,
          amount,
          transactionStatus: 'succesful',
          transactionType,
        },
      ],
      { session }
    );
    let initiatorBalanceUpdate = 0;
    if (transactionType === 'cashIn')
      initiatorBalanceUpdate = -amount + amount * commission;
    else if (transactionType === 'cashOut')
      initiatorBalanceUpdate = -(amount + amount * commission);
    else if (transactionType === 'sendMoney')
      initiatorBalanceUpdate = -(amount + amount * commission);

    await WalletModel.updateOne(
      { walletOwnerId: initiator._id },
      { $inc: { balance: initiatorBalanceUpdate } },
      { session }
    );

    await WalletModel.updateOne(
      { walletOwnerId: recipient._id },
      { $inc: { balance: amount } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true, transaction };
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    session.endSession();
    if (error instanceof ApiError) {
      throw new ApiError(status.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      'An Internal Server Error occurred:'
    );
  }
  return { success: false, transaction: null };
};
