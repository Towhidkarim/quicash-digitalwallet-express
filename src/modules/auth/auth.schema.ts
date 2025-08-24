import { z } from 'zod';
import { Roles } from '../../config/roles';

export const requestUserSchema = z.object({
  _id: z.string(),
  email: z.email(),
  phoneNumber: z.string().regex(/^01\d{9}$/),
  role: z.enum(Object.values(Roles)),
});
export type TRequestUser = z.infer<typeof requestUserSchema>;

export const signUpSchema = z.object({
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
  role: z.enum(['user', 'agent']).optional(),
  email: z.email(),
  phoneNumber: z.string().regex(/^01\d{9}$/),
  password: z.string().min(6),
});

export const signInSchema = z.object({
  phoneNumber: z.string().regex(/^01\d{9}$/),
  password: z.string().min(6),
});
