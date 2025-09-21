import { type Request, type Response } from 'express';
import { type EmailJobData } from '../../types/email.types.js';
import { type MailgunEmailService } from './email.service.js';
import { EmailTemplates } from './email.template.js';

export class EmailController {
  private emailService: MailgunEmailService;

  constructor(emailService: MailgunEmailService) {
    this.emailService = emailService;
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
    return 'Unknown error';
  }

  async sendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, verificationToken } = req.body as {
        email: string;
        name: string;
        verificationToken: string;
      };

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const html = EmailTemplates.welcomeEmail(name, verificationLink);

      const emailData: EmailJobData = {
        emailOptions: {
          to: email,
          subject: 'Welcome to Our App - Verify Your Email',
          html,
        },
        priority: 1,
      };

      await this.emailService.sendEmail(emailData);

      res.status(202).json({
        success: true,
        message: 'Welcome email queued successfully',
      });
    } catch (error) {
      console.error('Error queuing welcome email:', this.getErrorMessage(error));
      res.status(500).json({
        success: false,
        message: 'Failed to queue welcome email',
      });
    }
  }

  async sendPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email, resetToken } = req.body as { email: string; resetToken: string };

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const html = EmailTemplates.passwordReset(resetLink);

      const emailData: EmailJobData = {
        emailOptions: {
          to: email,
          subject: 'Password Reset Request',
          html,
        },
        priority: 2, // Higher priority for password resets
      };

      await this.emailService.sendEmail(emailData);

      res.status(202).json({
        success: true,
        message: 'Password reset email queued successfully',
      });
    } catch (error) {
      console.error('Error queuing password reset email:', this.getErrorMessage(error));
      res.status(500).json({
        success: false,
        message: 'Failed to queue password reset email',
      });
    }
  }

  async sendCustomEmail(req: Request, res: Response): Promise<void> {
    try {
      const emailData: EmailJobData = req.body as EmailJobData;

      await this.emailService.sendEmail(emailData);

      res.status(202).json({
        success: true,
        message: 'Email queued successfully',
      });
    } catch (error) {
      console.error('Error queuing email:', this.getErrorMessage(error));
      res.status(500).json({
        success: false,
        message: 'Failed to queue email',
      });
    }
  }
}
