export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  encoding?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface EmailJobData {
  emailOptions: EmailOptions;
  templateName?: string;
  templateData?: Record<string, any>;
  priority?: number;
  attempts?: number;
}

export interface EmailService {
  sendEmail(data: EmailJobData): Promise<void>;
  processEmailQueue(): void;
}

//mailgun support type
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName?: string;
}
