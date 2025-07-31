import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.custom<Types.ObjectId>(
  (val) => val instanceof Types.ObjectId,
  { message: 'Invalid ObjectId' }
);

export const transactionSchema = z.object({
  _id: z.string().optional(),
  initiatorId: objectIdSchema,
  recipientId: objectIdSchema,
  initiatorName: z.string(),
  recipientName: z.string(),
  transactionType: z.enum(['cashIn', 'cashOut', 'sendMoney', 'addMoneyAdmin']),
  amount: z.number().gt(0),
  transactionStatus: z.enum(['pending', 'succesful', 'reversed']),
  createdAt: z.date().optional(),
  updtedAt: z.date().optional(),
});
