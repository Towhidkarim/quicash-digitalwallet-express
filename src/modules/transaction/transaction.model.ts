import { model, Schema } from 'mongoose';
import { z } from 'zod';
import { transactionSchema } from './transaction.schema';

type TTransaction = z.infer<typeof transactionSchema>;
const transactionDbSchema = new Schema<TTransaction>(
  {
    amount: { type: Number, required: true },
    initiatorName: { type: String, required: true },
    recipientName: { type: String, required: true },
    initiatorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    recipientId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    transactionType: {
      type: String,
      enum: ['cashIn', 'cashOut', 'sendMoney', 'addMoneyAdmin'],
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'succesful', 'reversed'],
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const TransactionModel = model<TTransaction>(
  'Transaction',
  transactionDbSchema
);
