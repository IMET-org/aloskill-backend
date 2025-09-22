/* eslint-disable @typescript-eslint/no-unsafe-call */
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { getMailgunConfig } from '../../config/mailgun.js';
import {
  type EmailJobData,
  type EmailOptions,
  type EmailService,
} from '../../types/email.types.js';
import { EmailQueue } from './email.queue.js';

// Minimal Mailgun client typing for the used surface
interface MailgunClient {
  messages: {
    create: (domain: string, data: Record<string, unknown>) => Promise<unknown>;
  };
}

export class MailgunEmailService implements EmailService {
  private mailgunClient!: MailgunClient;
  private emailQueue: EmailQueue;
  private config: ReturnType<typeof getMailgunConfig>;

  constructor(redisUrl: string) {
    this.config = getMailgunConfig();
    this.emailQueue = new EmailQueue(redisUrl);
    this.initializeMailgun();
  }

  private initializeMailgun(): void {
    const mailgun = new Mailgun(formData);
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: this.config.apiKey,
    }) as unknown as MailgunClient;
  }

  private async sendMailgunEmail(emailOptions: EmailOptions): Promise<void> {
    const { fromEmail, fromName } = this.config;
    const from = emailOptions.from ?? `${fromName} <${fromEmail}>`;

    const data = {
      from,
      to: Array.isArray(emailOptions.to) ? emailOptions.to : [emailOptions.to],
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
      ...(emailOptions.cc && {
        cc: Array.isArray(emailOptions.cc) ? emailOptions.cc : [emailOptions.cc],
      }),
      ...(emailOptions.bcc && {
        bcc: Array.isArray(emailOptions.bcc) ? emailOptions.bcc : [emailOptions.bcc],
      }),
      ...(emailOptions.replyTo && { 'h:Reply-To': emailOptions.replyTo }),
    };

    try {
      await this.mailgunClient.messages.create(this.config.domain, data);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Mailgun error:', error);
      throw new Error(`Failed to send email`);
    }
  }

  async sendEmail(data: EmailJobData): Promise<void> {
    await this.emailQueue.addEmailJob(data);
  }

  processEmailQueue(): void {
    this.emailQueue.getQueue().process(async job => {
      try {
        console.log(`Processing email job ${job.id}`);
        await this.sendMailgunEmail(job.data.emailOptions as EmailOptions);
      } catch (error) {
        console.error(`Failed to process email job ${job.id}:`, error);
        throw error;
      }
    });
  }

  async close(): Promise<void> {
    await this.emailQueue.close();
  }
}
