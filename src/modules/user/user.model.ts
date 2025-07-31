import { model, Schema } from 'mongoose';
import { userSchema } from './user.schema';
import { z } from 'zod';
import { Roles } from '../../config/roles';

type TUser = z.infer<typeof userSchema>;
const userDBSchema = new Schema<TUser>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: Object.values(Roles),
      required: true,
      default: 'user',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive'],
      required: true,
      default: 'active',
    },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = model<TUser>('User', userDBSchema);
