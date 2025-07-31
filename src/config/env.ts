import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { config } from 'dotenv';
config();

export const env = createEnv({
  server: {
    NODE_ENV: z.string(),
    //Super User
    SU_FIRST_NAME: z.string().min(1),
    SU_LAST_NAME: z.string().min(1),
    SU_EMAIL: z.string().min(1),
    SU_PHONE_NUMBER: z.string().min(1),
    SU_PASSWORD: z.string().min(1),
    //JWT
    JWT_SECRET: z.string().min(10),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
    //Mongo
    MOGNODB_URI: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
