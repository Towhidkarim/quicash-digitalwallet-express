import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.custom<Types.ObjectId>(
  (val) => val instanceof Types.ObjectId,
  { message: 'Invalid ObjectId' }
);

export const walletSchema = z.object({
  _id: z.string().optional(),
  walletOwnerId: objectIdSchema,
  walletStatus: z.enum(['frozen', 'active']),
  balance: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
