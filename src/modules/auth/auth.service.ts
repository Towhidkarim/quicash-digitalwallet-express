import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signUpSchema } from './auth.schema';
import { UserModel } from '../user/user.model';
import { startSession as startMongooseSession } from 'mongoose';
import { WalletModel } from '../wallet/wallet.model';
import { ApiError } from '../../utils/apiError';
import { status } from 'http-status';
import { userSchema } from '../user/user.schema';
import { walletSchema } from '../wallet/wallet.schema';

export const createAccount = async (
  newUserData: z.infer<typeof signUpSchema>
) => {
  const session = await startMongooseSession();
  let results: {
    newUser: z.infer<typeof userSchema>;
    newWallet: z.infer<typeof walletSchema>;
  } | null = null;
  try {
    session.startTransaction();

    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(newUserData.password, SALT_ROUNDS);

    const newUser = await UserModel.create(
      [
        {
          ...newUserData,
          role: 'user',
          password: hashedPassword,
        },
      ],
      { session }
    );

    const STARTING_BALANCE = 50;

    const newWallet = await WalletModel.create(
      [
        {
          walletOwnerId: newUser[0]._id,
          balance: STARTING_BALANCE,
          walletStatus: 'active',
        },
      ],
      { session }
    );
    results = {
      newUser: newUser[0],
      newWallet: newWallet[0],
    };
    await session.commitTransaction();
  } catch (error) {
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      `Internal server error: ${error}`
    );
  } finally {
    session.endSession();
    return { ...results };
  }
};
