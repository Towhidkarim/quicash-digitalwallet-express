import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { status } from 'http-status';
import { UserModel } from './user.model';
import { sendResponse } from '../../utils/sendResponse';
import { validateSchema } from '../../utils/validateSchema';
import { userUpdateSchema } from './user.schema';
import { Roles } from '../../config/roles';

const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const idToFetch = req.params.id;
    if (!user) throw new ApiError(status.UNAUTHORIZED, 'User Object not found');
    if (idToFetch !== user._id && user.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to access this information'
      );

    const userInfo = await UserModel.findById(idToFetch, { password: 0 });
    if (!userInfo) throw new ApiError(status.NOT_FOUND, 'User not found');

    sendResponse(res, {
      message: 'Information retrived succesfully',
      statusCode: status.OK,
      data: userInfo,
    });
  }
);

const getUserByPhoneNumber = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const phoneNumberToFetch = req.params.phoneNumber;
    if (!user) throw new ApiError(status.UNAUTHORIZED, 'User Object not found');
    if (phoneNumberToFetch !== user.phoneNumber && user.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to access this information'
      );

    const userInfo = await UserModel.find(
      { phoneNumber: phoneNumberToFetch },
      { password: 0 }
    );
    if (!userInfo) throw new ApiError(status.NOT_FOUND, 'User not found');

    sendResponse(res, {
      message: 'Information retrived succesfully',
      statusCode: status.OK,
      data: userInfo,
    });
  }
);

const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { skip, limit, sortBy, sortOrder } = req.query;
    if (!user)
      throw new ApiError(status.UNAUTHORIZED, 'User Request Object not found');
    if (user.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to access this information'
      );

    const userInfo = await UserModel.find({}, { password: 0 })
      .limit(Number(limit ?? 0))
      .skip(Number(skip ?? 0))
      .sort({
        [sortBy && typeof (sortBy === 'string') ? String(sortBy) : 'createdAt']:
          sortOrder === 'asc' ? 1 : -1,
      });
    if (!userInfo) throw new ApiError(status.NOT_FOUND, 'User not found');

    sendResponse(res, {
      message: 'Information retrived succesfully',
      statusCode: status.OK,
      data: userInfo,
    });
  }
);

const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const idToUpdate = req.params.id;
    const parsedBody = validateSchema(userUpdateSchema, req.body);
    if (!user) throw new ApiError(status.UNAUTHORIZED, 'User Object not found');
    if (idToUpdate !== user._id && user.role !== 'admin')
      throw new ApiError(
        status.UNAUTHORIZED,
        'You are not authorized to perform this action'
      );

    const userInfo = await UserModel.findByIdAndUpdate(
      idToUpdate,
      { ...parsedBody },
      { new: true }
    );
    if (!userInfo) throw new ApiError(status.NOT_FOUND, 'User not found');

    // const { password, ...userInfoToSend } = userInfo;
    userInfo.password = '';

    sendResponse(res, {
      message: 'Information Updated Succesfully',
      statusCode: status.OK,
      data: userInfo,
    });
  }
);

const setAccountStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { statusToSet, targetAccountPhoneNumber } = req.body;
    if (statusToSet !== 'active' && statusToSet !== 'inactive') {
      throw new ApiError(status.BAD_REQUEST, 'Invalid account status');
    }
    const user = await UserModel.findOneAndUpdate(
      { phoneNumber: targetAccountPhoneNumber },
      { accountStatus: statusToSet },
      { new: true }
    );
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }
    user.password = '';
    sendResponse(res, {
      message: 'Account status updated successfully',
      statusCode: status.OK,
      data: user,
    });
  }
);

const setUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { roleToSet, targetAccountPhoneNumber } = req.body;

    if (!Object.values(Roles).includes(roleToSet))
      throw new ApiError(status.BAD_REQUEST, 'Invalid user role');
    const user = await UserModel.findOneAndUpdate(
      { phoneNumber: targetAccountPhoneNumber },
      { role: roleToSet },
      { new: true }
    );
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }
    user.password = ''; // Remove password from response
    sendResponse(res, {
      message: 'Account status updated successfully',
      statusCode: status.OK,
      data: user,
    });
  }
);

export const UserController = {
  getUserById,
  getAllUsers,
  updateUser,
  setAccountStatus,
  getUserByPhoneNumber,
  setUserRole,
};
