/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { EmailOptions } from '../types/mail.js';
import { addEmailToQueue } from './queue.js';

export type EmailTemplate<Props> = (props: Props) => string;

export const MailService = {
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
