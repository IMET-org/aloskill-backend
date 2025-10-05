/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Queue } from 'bullmq';
import redisConnection from './redisConnection.js';
import type { EmailOptions } from '../types/mail.js';

export const emailQueue = new Queue<EmailOptions>('emailQueue', { connection: redisConnection });

export const addEmailToQueue = async (email: EmailOptions) => {
  await emailQueue.add('sendEmail', email);
};
