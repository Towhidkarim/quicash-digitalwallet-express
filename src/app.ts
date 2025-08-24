import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middlewares/error.midleware';
import { status } from 'http-status';
import { notFound } from './middlewares/notfound.middleware';
import { connectDB } from './config/connectDB';
import { config } from 'dotenv';
import { versionOneRouter } from './Router/versionOne';
config();
export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(async (req, res, next) => {
  await connectDB();
  next();
});
app.get('/', (req, res) => res.send('App succesfully Served'));

app.use('/api/v1', versionOneRouter);

app.use(globalErrorHandler);
app.use(notFound);
