/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Queue, { type Queue as BullQueue, type Job, type QueueOptions } from 'bull';
import { type EmailJobData } from '../../types/email.types.js';


type BullQueueConstructor = new <T>(
  queueName: string,
  url: string,
  opts?: QueueOptions
) => BullQueue<T>;

export class EmailQueue {
  private queue: BullQueue<EmailJobData>;

  constructor(redisUrl: string, queueName = 'email') {
    const BullCtor = Queue as unknown as BullQueueConstructor;

    this.queue = new BullCtor<EmailJobData>(queueName, redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.queue.on('completed', (job: Job<EmailJobData>) => {
      console.log(`Email job ${job.id} completed`);
    });

    this.queue.on('failed', (job: Job<EmailJobData>, error: unknown) => {
      const jobId = job?.id ?? 'unknown';
      const errorMessage = this.getErrorMessage(error);
      console.error(`Email job ${jobId} failed:`, errorMessage);
    });

    this.queue.on('error', (error: unknown) => {
      const errorMessage = this.getErrorMessage(error);
      console.error('Email queue error:', errorMessage);
    });

    this.queue.on('waiting', (jobId: string | number) => {
      console.log(`Email job ${jobId} waiting to be processed`);
    });

    this.queue.on('active', (job: Job<EmailJobData>) => {
      console.log(`Email job ${job.id} is now active`);
    });

    this.queue.on('stalled', (job: Job<EmailJobData>) => {
      console.warn(`Email job ${job.id} has stalled`);
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'Unknown error occurred';
  }

  addEmailJob(data: EmailJobData): Promise<Job<EmailJobData>> {
    const options = {
      priority: data.priority ?? 1,
      attempts: data.attempts ?? 3,
    };

    return this.queue.add(data, options);
  }

  getQueue(): BullQueue<EmailJobData> {
    return this.queue;
  }

  async close(): Promise<void> {
    await this.queue.close();
  }

  // Optional: Add method to clean up old jobs
  async cleanOldJobs(gracePeriodMs = 1000 * 60 * 60): Promise<void> {
    try {
      await this.queue.clean(gracePeriodMs, 'completed');
      await this.queue.clean(gracePeriodMs, 'failed');
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      console.error('Error cleaning old jobs:', errorMessage);
    }
  }
}
