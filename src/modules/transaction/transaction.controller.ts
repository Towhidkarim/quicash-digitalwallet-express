import { asyncHandler } from '../../utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../utils/apiError';
import { status } from 'http-status';
import { validateSchema } from '../../utils/validateSchema';
import { TransactionModel } from './transaction.model';
import { sendResponse } from '../../utils/sendResponse';
import { requestUserSchema } from '../auth/auth.schema';
import { get } from 'http';
import { startSession as startMongooseSession } from 'mongoose';
import { UserModel } from '../user/user.model';
import { send } from 'process';
import { WalletModel } from '../wallet/wallet.model';
import { COMISSIONS } from '../../config/comissions';
import { commitMoneyTransaction } from './transaction.service';

const getTransactionsByUserId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const idToFetch = req.params.userId;
    if (!user) throw new ApiError(status.UNAUTHORIZED, 'User Object not found');

    const requestUser = validateSchema(requestUserSchema, user);
    if (requestUser.role !== 'admin' && requestUser._id !== user._id)
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const transactions = await TransactionModel.find({
      $or: [{ initiatorId: idToFetch }, { recipientId: idToFetch }],
    });

    if (!transactions || transactions.length === 0)
      throw new ApiError(status.NOT_FOUND, 'No transactions found');

    sendResponse(res, {
      message: 'Transactions retrieved successfully',
      statusCode: status.OK,
      data: transactions,
    });
  }
);

const getMyTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const requestUser = validateSchema(requestUserSchema, user);

    const transactions = await TransactionModel.find({
      $or: [{ initiatorId: requestUser._id }, { recipientId: requestUser._id }],
    });

    if (!transactions || transactions.length === 0)
      throw new ApiError(status.NOT_FOUND, 'No transactions found');

    sendResponse(res, {
      message: 'Transactions retrieved successfully',
      statusCode: status.OK,
      data: transactions,
    });
  }
);

const getTransactionById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const transactionId = req.params.id;
    if (!transactionId)
      throw new ApiError(status.BAD_REQUEST, 'Transaction ID is required');

    const transaction = await TransactionModel.findById(transactionId);

    if (!transaction)
      throw new ApiError(status.NOT_FOUND, 'No transactions found');

    sendResponse(res, {
      message: 'Transactions retrieved successfully',
      statusCode: status.OK,
      data: transaction,
    });
  }
);

const getAllTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { skip, limit, sortBy, sortOrder } = req.query;
    const requestUser = validateSchema(requestUserSchema, req.user);
    if (requestUser.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const transactionInfo = await TransactionModel.find()
      .skip(Number(skip ?? 0))
      .limit(Number(limit ?? 0))
      .sort({
        [sortBy && typeof (sortBy === 'string') ? String(sortBy) : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      });
    if (!transactionInfo || transactionInfo.length === 0)
      throw new ApiError(status.NOT_FOUND, 'No wallets found');

    sendResponse(res, {
      message: 'All transaction information retrived succesfully',
      statusCode: status.OK,
      data: transactionInfo,
    });
  }
);

const getAgentCommissionsById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { skip, limit, sortBy, sortOrder } = req.query;
    const userId = req.params.userId;
    if (!userId) throw new ApiError(status.BAD_REQUEST, 'User ID is required');
    const requestUser = validateSchema(requestUserSchema, req.user);
    if (requestUser.role !== 'agent' && requestUser.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const user = await UserModel.findById(userId, { role: 1 });
    if (user?.role !== 'agent')
      throw new ApiError(status.NOT_FOUND, 'User is not an agent');
    const transactionInfo = await TransactionModel.find(
      {
        $or: [{ initiatorId: userId }, { recipientId: userId }],
      },
      { _id: 1, amount: 1, transactionType: 1, createdAt: 1 }
    )
      .skip(Number(skip ?? 0))
      .limit(Number(limit ?? 0))
      .sort({
        [sortBy && typeof (sortBy === 'string') ? String(sortBy) : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      });

    if (!transactionInfo || transactionInfo.length === 0)
      throw new ApiError(status.NOT_FOUND, 'No wallets found');
    const result = transactionInfo.map((transaction) => ({
      id: transaction._id,
      amount:
        transaction.amount *
        (COMISSIONS[transaction.transactionType as keyof typeof COMISSIONS] ??
          0),
      transactionType: transaction.transactionType,
      createdAt: transaction.createdAt,
    }));

    sendResponse(res, {
      message: 'All commission information retrieved successfully',
      statusCode: status.OK,
      data: result,
    });
  }
);

const sendMoney = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipientPhoneNumber, amount } = req.body;

    if (!recipientPhoneNumber || !amount || typeof amount !== 'number') {
      throw new ApiError(
        status.BAD_REQUEST,
        'Recipient phone number and amount are required'
      );
    }

    const user = req.user;
    const parsedUser = validateSchema(requestUserSchema, user);
    if (!user || !parsedUser)
      throw new ApiError(status.UNAUTHORIZED, 'User Object not found');

    const { success: transactionSucceeded, transaction: transactionData } =
      await commitMoneyTransaction({
        user: parsedUser,
        recipientPhoneNumber,
        amount,
        transactionType: 'sendMoney',
        commission: COMISSIONS.sendMoney,
      });

    sendResponse(res, {
      message: 'Money sent successfully',
      statusCode: transactionSucceeded ? status.CREATED : status.BAD_REQUEST,
      data: transactionData,
    });
  }
);

const cashOut = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipientPhoneNumber, amount } = req.body;

    if (!recipientPhoneNumber || !amount || typeof amount !== 'number') {
      throw new ApiError(
        status.BAD_REQUEST,
        'Recipient phone number and amount are required'
      );
    }

    const user = req.user;
    const parsedUser = validateSchema(requestUserSchema, user);
    if (!user || !parsedUser)
      throw new ApiError(status.UNAUTHORIZED, 'User Object not found');

    const { success: transactionSucceeded, transaction: transactionData } =
      await commitMoneyTransaction({
        user: parsedUser,
        recipientPhoneNumber,
        amount,
        transactionType: 'cashOut',
        commission: COMISSIONS.cashOut,
      });

    sendResponse(res, {
      message: 'Money cashed out successfully',
      statusCode: transactionSucceeded ? status.CREATED : status.BAD_REQUEST,
      data: transactionData,
    });
  }
);

const cashIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipientPhoneNumber, amount } = req.body;

    if (!recipientPhoneNumber || !amount || typeof amount !== 'number') {
      throw new ApiError(
        status.BAD_REQUEST,
        'Recipient phone number and amount are required'
      );
    }

    const user = req.user;
    const parsedUser = validateSchema(requestUserSchema, user);
    if (!user || !parsedUser)
      throw new ApiError(status.UNAUTHORIZED, 'User Object not found');

    const { success: transactionSucceeded, transaction: transactionData } =
      await commitMoneyTransaction({
        user: parsedUser,
        recipientPhoneNumber,
        amount,
        transactionType: 'cashIn',
        commission: COMISSIONS.cashIn,
      });

    sendResponse(res, {
      message: 'Money cashed in successfully',
      statusCode: transactionSucceeded ? status.CREATED : status.BAD_REQUEST,
      data: transactionData,
    });
  }
);

const addMoneyAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipientPhoneNumber, amount } = req.body;

    if (!recipientPhoneNumber || !amount || typeof amount !== 'number') {
      throw new ApiError(
        status.BAD_REQUEST,
        'Recipient phone number and amount are required'
      );
    }

    const user = req.user;
    const parsedUser = validateSchema(requestUserSchema, user);
    if (!user || !parsedUser)
      throw new ApiError(status.UNAUTHORIZED, 'User Object not found');

    const { success: transactionSucceeded, transaction: transactionData } =
      await commitMoneyTransaction({
        user: parsedUser,
        recipientPhoneNumber,
        amount,
        transactionType: 'addMoneyAdmin',
        commission: 0,
      });

    sendResponse(res, {
      message: 'Money added by admin successfully',
      statusCode: transactionSucceeded ? status.CREATED : status.BAD_REQUEST,
      data: transactionData,
    });
  }
);

export const TransactionController = {
  getTransactionsByUserId,
  getTransactionById,
  getMyTransactions,
  getAllTransactions,
  sendMoney,
  cashIn,
  cashOut,
  addMoneyAdmin,
  getAgentCommissionsById,
};
