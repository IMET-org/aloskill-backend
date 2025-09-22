import { EmailController } from './email.controller.js';
import { MailgunEmailService } from './email.service.js';

export const initializeEmailSystem = (redisUrl: string):object => {
  const emailService = new MailgunEmailService(redisUrl);
  const emailController = new EmailController(emailService);

  emailService.processEmailQueue();

  return {
    emailService,
    emailController,
  };
};
