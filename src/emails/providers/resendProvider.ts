import { Resend } from 'resend';
import { EmailOptions, IMailProvider } from '../../types/mail.js';

const resendClient = new Resend(process.env.RESEND_API_KEY!);

export class ResendProvider implements IMailProvider {
  async sendEmail({ to, subject, html, from }: EmailOptions) {
    await resendClient.emails.send({
      from: from || 'noreply@aloskill.com',
      to,
      subject,
      html,
    });
  }
}
