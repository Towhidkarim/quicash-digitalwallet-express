import { model, Schema } from 'mongoose';
import { walletSchema } from './wallet.schema';
import { z } from 'zod';

type TWallet = z.infer<typeof walletSchema>;
const walletDbSchema = new Schema<TWallet>(
  {
    walletOwnerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    walletStatus: {
      type: String,
      enum: ['active', 'frozen'],
      required: true,
      default: 'active',
    },
    balance: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const WalletModel = model<TWallet>('Wallet', walletDbSchema);
