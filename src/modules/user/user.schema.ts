import z from 'zod';
import { Roles } from '../../config/roles';

export const userSchema = z.object({
  _id: z.string().optional(),
  firstName: z
    .string()
    .regex(
      /^[a-zA-Z]{3,16}$/,
      'Fist Name must be 3-16 letters with no numbers or symbols'
    ),
  lastName: z
    .string()
    .regex(
      /^[a-zA-Z]{3,16}$/,
      'Last Name must be 3-16 letters with no numbers or symbols'
    ),
  email: z.email(),
  phoneNumber: z.string().regex(/^01\d{9}$/),
  password: z.string().min(6),
  role: z.enum(Object.values(Roles)),
  accountStatus: z.enum(['active', 'inactive']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .regex(
      /^[a-zA-Z]{3,16}$/,
      'Fist Name must be 3-16 letters with no numbers or symbols'
    )
    .optional(),
  lastName: z
    .string()
    .regex(
      /^[a-zA-Z]{3,16}$/,
      'Last Name must be 3-16 letters with no numbers or symbols'
    )
    .optional(),
  email: z.email().optional(),
});
