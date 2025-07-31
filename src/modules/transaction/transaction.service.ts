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
  transactionType: 'cashIn' | 'cashOut' | 'sendMoney';
  commission: number;
}) => {
  const session = await startMongooseSession();
  try {
    const recipient = await UserModel.findOne(
      { phoneNumber: recipientPhoneNumber },
      { _id: 1, firstName: 1, lastName: 1, phoneNumber: 1 }
    );
    const initiator = await UserModel.findById(user._id, {
      _id: 1,
      firstName: 1,
      lastName: 1,
      phoneNumber: 1,
    });

    const initiatorWallet = await WalletModel.findOne({
      walletOwnerId: user._id,
    });
    if (!recipient || !initiator || !initiatorWallet) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }
    if (initiator._id === recipient._id)
      throw new ApiError(
        status.BAD_REQUEST,
        'You cannot send money to yourself'
      );

    if (initiatorWallet.balance < amount + amount * commission)
      throw new ApiError(status.BAD_REQUEST, 'Insufficient balance');

    session.startTransaction();

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
    await WalletModel.updateOne(
      { walletOwnerId: initiator._id },
      { $inc: { balance: -(amount + amount * commission) } },
      { session }
    );

    await WalletModel.updateOne(
      { walletOwnerId: recipient._id },
      { $inc: { balance: amount } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    //   sendResponse(res, {
    //     message: 'Money sent successfully',
    //     statusCode: status.CREATED,
    //     data: transaction,
    //   });
    return { success: true, transaction };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      'An Internal Server Error occurred'
    );
    //   sendResponse(res, {
    //     message: 'Failed to send money',
    //     statusCode: status.INTERNAL_SERVER_ERROR,
    //     data: error,
    //   });
  }
  return { success: false, transaction: null };
};
