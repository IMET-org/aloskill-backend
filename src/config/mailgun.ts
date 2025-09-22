import type { MailgunConfig } from '@/types/email.types.js';

export const getMailgunConfig = (): MailgunConfig => {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;

  if (!apiKey || !domain || !fromEmail) {
    throw new Error('Mailgun configuration is missing');
  }

  return {
    apiKey,
    domain,
    fromEmail,
    fromName: process.env.MAILGUN_FROM_NAME ?? 'aloSkill',
  };
};
