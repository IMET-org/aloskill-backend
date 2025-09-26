<<<<<<< HEAD
import { Resend } from 'resend';
import { EmailOptions, IMailProvider } from '../../types/mail.js';

const resendClient = new Resend(process.env.RESEND_API_KEY!);
=======
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Resend } from 'resend';
import type { EmailOptions, IMailProvider } from '../../types/mail.js';

const resendClient = new Resend(process.env.RESEND_API_KEY);
>>>>>>> 9336b8479e039cf93f88af490909248d1d57f515

export class ResendProvider implements IMailProvider {
  async sendEmail({ to, subject, html, from }: EmailOptions) {
    await resendClient.emails.send({
<<<<<<< HEAD
      from: from || 'sandbox@resend.dev',
=======
      from: from ?? 'sandbox@resend.dev',
>>>>>>> 9336b8479e039cf93f88af490909248d1d57f515
      to,
      subject,
      html,
    });
  }
}
