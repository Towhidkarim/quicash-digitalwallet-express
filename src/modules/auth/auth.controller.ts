import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateSchema } from '../../utils/validateSchema';
import {
  requestUserSchema,
  signInSchema,
  signUpSchema,
  TRequestUser,
} from './auth.schema';
import bcrypt from 'bcryptjs';
import { UserModel } from '../user/user.model';
import { sendResponse } from '../../utils/sendResponse';
import { status } from 'http-status';
import { ApiError } from '../../utils/apiError';
import { createToken } from '../../utils/createToken';
import { env } from '../../config/env';
import { getAuthToken } from '../../utils/getAuthToken';
import { verifyToken } from '../../utils/verifyToken';
import { createAccount } from './auth.service';

const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedBody = validateSchema(signInSchema, req.body);

    const user = await UserModel.find({
      phoneNumber: parsedBody.phoneNumber,
    }).limit(1);

    const existingUser = user[0];

    if (!existingUser)
      throw new ApiError(
        status.BAD_REQUEST,
        'User with Phone number not found'
      );
    const passwordMatched = await bcrypt.compare(
      parsedBody.password,
      user[0].password
    );
    if (!passwordMatched)
      throw new ApiError(status.UNAUTHORIZED, 'Incorrect Password');
    if (passwordMatched) {
      const requestUser: TRequestUser = {
        _id: String(existingUser._id),
        email: existingUser.email,
        role: existingUser.role,
        phoneNumber: existingUser.phoneNumber,
      };

      const accessToken = await createToken(
        requestUser,
        env.ACCESS_TOKEN_EXPIRES_IN
      );
      const refreshToken = await createToken(
        requestUser,
        env.REFRESH_TOKEN_EXPIRES_IN
      );

      res.cookie('refresh_token', refreshToken, {
        httpOnly: env.NODE_ENV === 'production',
        secure: true,
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('access_token', accessToken, {
        httpOnly: env.NODE_ENV === 'production',
        secure: true,
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
      });
      const { password, ...userInfoToSend } = existingUser;
      sendResponse(res, {
        statusCode: status.OK,
        message: 'Signed In succesfully',
        data: { userInfo: userInfoToSend, accessToken, refreshToken },
      });
    }
  }
);

const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsedBody = validateSchema(signUpSchema, req.body);

    const existingUser = await UserModel.find({
      phoneNumber: parsedBody.phoneNumber,
    });
    if (existingUser.length > 0)
      throw new ApiError(
        status.BAD_REQUEST,
        'User with given Phone Number already exists'
      );

    // const SALT_ROUNDS = 10;
    // const hashedPassword = await bcrypt.hash(parsedBody.password, SALT_ROUNDS);
    // const newUser = await UserModel.create({
    //   ...parsedBody,
    //   role: 'user',
    //   password: hashedPassword,
    // });
    const { newUser, newWallet } = await createAccount(parsedBody);
    if (!newUser || !newWallet)
      throw new ApiError(status.INTERNAL_SERVER_ERROR, 'User creation failed');
    const { password, ...infoToSend } = newUser;
    sendResponse(res, {
      message: 'User Sign Up Succesful!',
      statusCode: status.OK,
      data: { newUser: infoToSend, newWallet },
    });
  }
);

const createSuperUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const existingUser = await UserModel.findOne({
      phoneNumber: env.SU_PHONE_NUMBER,
    });

    if (existingUser) {
      return sendResponse(res, {
        message: 'Super User already exists',
        statusCode: status.OK,
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(env.SU_PASSWORD, 10);
    const newUser = await UserModel.create(
      {
        firstName: env.SU_FIRST_NAME,
        lastName: env.SU_LAST_NAME,
        email: env.SU_EMAIL,
        phoneNumber: env.SU_PHONE_NUMBER,
        role: 'admin',
        password: hashedPassword,
      },
      { runValidators: true }
    );

    sendResponse(res, {
      message: 'Super User created successfully',
      statusCode: status.CREATED,
      data: newUser,
    });
  }
);

const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authToken = getAuthToken(req) || req.cookies.refresh_token;
    if (!authToken)
      throw new ApiError(status.UNAUTHORIZED, 'No Refresh Token Provided');

    const payload = await verifyToken(authToken);
    const verifiedPayload = validateSchema(requestUserSchema, payload);
    const newToken = createToken(verifiedPayload, env.ACCESS_TOKEN_EXPIRES_IN);

    res.cookie('access_token', newToken, {
      httpOnly: env.NODE_ENV === 'production',
      secure: true,
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
    sendResponse(res, {
      data: { accessToken: newToken },
      statusCode: status.OK,
      message: 'Token Refreshed',
    });
  }
);

export const AuthController = {
  signIn,
  signUp,
  refresh,
  createSuperUser,
};
