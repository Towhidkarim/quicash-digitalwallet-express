import { connect } from 'mongoose';
import { env } from './env';

export async function connectDB() {
  try {
    await connect(env.MOGNODB_URI);
  } catch (error) {
    console.error(error);
  }
}
