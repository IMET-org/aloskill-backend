import { EmailOptions } from '../types/mail.js';
import { addEmailToQueue } from './queue.js';
import resetPasswordTemplate from './templates/resetPassword.js';
import signupWelcomeTemplate from './templates/signupWelcome.js';

export type EmailTemplate<Props> = (props: Props) => string;

export const MailService = {
  /**
   * Send an email via the queue
   * @param to Recipient email address
   * @param subject Email subject line
   * @param template Template function that returns HTML
   * @param templateProps Props passed to the template
   * @param from Optional sender email
   */
  sendEmail: async <Props>(
    to: string,
    subject: string,
    template: EmailTemplate<Props>,
    templateProps: Props,
    from?: string
  ) => {
    const emailOptions: EmailOptions = {
      to,
      subject,
      html: template(templateProps),
      from,
    };

    // Push to Redis queue for asynchronous processing
    await addEmailToQueue(emailOptions);
  },
};

export const emailOptions = {
  // from: 'Acme <onboarding@resend.dev>',
  to: process.env.TEST_EMAIL!,
  subject: 'Welcome to Aloskill!',
  html: signupWelcomeTemplate({
    name: 'Sumaiya',
    verificationLink: 'https://aloskill.com/verify?token=abc123',
  }),
};

// await MailService.sendEmail(emailOptions.to, emailOptions.subject, signupWelcomeTemplate, {
//   name: 'Sumaiya',
//   verificationLink: 'https://aloskill.com/verify?token=abc123',
// });

// For reset password
// await MailService.sendEmail(
//   'zeroboolean@gmail.comm',
//   'Reset Your Password',
//   resetPasswordTemplate,
//   {
//     name: 'Sumaiya',
//     resetLink: 'https://aloskill.com/reset-password?token=xyz456',
//   }
// );
