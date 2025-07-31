import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { status } from 'http-status';
import { validateSchema } from '../../utils/validateSchema';
import { requestUserSchema } from '../auth/auth.schema';
import { WalletModel } from './wallet.model';
import { sendResponse } from '../../utils/sendResponse';

const getWalletById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const idToFetch = req.params.id;
    if (typeof idToFetch !== 'string')
      throw new ApiError(status.BAD_REQUEST, 'Invalid ID');

    const requestUser = validateSchema(requestUserSchema, req.user);
    if (idToFetch !== requestUser._id && requestUser.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const [walletInfo] = await WalletModel.find({ walletOwnerId: idToFetch });
    if (!walletInfo)
      throw new ApiError(status.NOT_FOUND, 'Wallet with given ID not found');

    sendResponse(res, {
      message: 'Wallet information retrived succesfully',
      statusCode: status.OK,
      data: walletInfo,
    });
  }
);

const getAllWallets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { skip, limit, sortBy, sortOrder } = req.query;
    const requestUser = validateSchema(requestUserSchema, req.user);
    if (requestUser.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const walletInfo = await WalletModel.find()
      .skip(Number(skip ?? 0))
      .limit(Number(limit ?? 0))
      .sort({
        [sortBy && typeof (sortBy === 'string') ? String(sortBy) : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      });
    if (!walletInfo || walletInfo.length === 0)
      throw new ApiError(status.NOT_FOUND, 'No wallets found');

    sendResponse(res, {
      message: 'All Wallet information retrived succesfully',
      statusCode: status.OK,
      data: walletInfo,
    });
  }
);

const setWalletStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletStatus, targetWalletOwnerId } = req.body;
    if (walletStatus !== 'active' && walletStatus !== 'frozen') {
      throw new ApiError(status.BAD_REQUEST, 'Invalid wallet status');
    }
    if (!targetWalletOwnerId)
      throw new ApiError(
        status.BAD_REQUEST,
        'Target wallet owner ID is required'
      );

    const walletInfo = await WalletModel.findOneAndUpdate(
      { walletOwnerId: targetWalletOwnerId },
      { walletStatus },
      { new: true }
    );
    if (!walletInfo)
      throw new ApiError(status.NOT_FOUND, 'Wallet with given ID not found');

    sendResponse(res, {
      message: `Wallet status updated to ${walletStatus} successfully`,
      statusCode: status.OK,
      data: walletInfo,
    });
  }
);

const getWalletByPhoneNumber = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const phoneNumber = req.params.phoneNumber;
    if (typeof phoneNumber !== 'string')
      throw new ApiError(status.BAD_REQUEST, 'Invalid Phone Number');

    const requestUser = validateSchema(requestUserSchema, req.user);
    if (requestUser.role !== 'admin' && requestUser.phoneNumber !== phoneNumber)
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to view this information'
      );

    const walletInfo = await WalletModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'walletOwnerId',
          foreignField: '_id',
          as: 'walletOwner',
        },
      },
      { $unwind: '$walletOwner' },
      { $match: { 'walletOwner.phoneNumber': phoneNumber } },
    ]);
    if (walletInfo.length === 0)
      throw new ApiError(
        status.NOT_FOUND,
        'Wallet with given Phone Number not found'
      );

    sendResponse(res, {
      message: 'Wallet information retrived succesfully',
      statusCode: status.OK,
      data: walletInfo,
    });
  }
);

export const WalletController = {
  getWalletById,
  getWalletByPhoneNumber,
  setWalletStatus,
  getAllWallets,
};
