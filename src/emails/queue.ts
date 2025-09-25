import { Queue } from 'bullmq';
import redisConnection from './redisConnection.js';
// import * as Redis from 'ioredis';
import { Redis } from 'ioredis';
import { EmailOptions } from '../types/mail.js';


export const emailQueue = new Queue<EmailOptions>('emailQueue', { connection: redisConnection, });

export const addEmailToQueue = async (email: EmailOptions) => {
  await emailQueue.add('sendEmail', email);
};
