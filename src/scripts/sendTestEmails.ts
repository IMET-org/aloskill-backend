import { MailService } from '../emails/mailService.js';
import resetPasswordTemplate from '../emails/templates/resetPassword.js';
import signupWelcomeTemplate from '../emails/templates/signupWelcome.js';

// Load environment variables
const TEST_EMAIL = process.env.TEST_EMAIL ?? 'mdarifulislam0238@gmail.com';

async function sendEmails() {
  // Welcome email
  await MailService.sendEmail(TEST_EMAIL, 'Welcome to Aloskill!', signupWelcomeTemplate, {
    name: 'Arif',
    verificationLink: 'http://localhost:5000/api/v1/auth/verify?token=abc123',
  });

  console.log('📨 Signup welcome email queued!');

  // Reset password email
  await MailService.sendEmail(TEST_EMAIL, '🔑 Reset Your Password', resetPasswordTemplate, {
    name: 'Arif',
    resetLink: 'https://aloskill.com/reset-password?token=xyz456',
  });
  console.log(`📨 Reset password email queued! Sent to ${TEST_EMAIL}`);
}

// Execute the script
sendEmails().catch(err => {
  console.error('❌ Error while sending test emails:', err);
});
