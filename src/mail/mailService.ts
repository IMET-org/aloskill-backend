// src/mail/mailService.ts
import { render } from "@react-email/render";
import { Resend } from "resend"; // for dev
// import AWS from "aws-sdk"; // for future AWS SES

import ResetPassword, { ResetPasswordProps } from  './templates/resetPassword.js';
import VerifyEmail, { VerifyEmailProps } from "./templates/verifyEmail.js";
import SignupWelcome, { SignupWelcomeProps } from "./templates/signupWelcome.js";

// map templates
type TemplateMap = {
  resetPassword: {
    component: React.FC<ResetPasswordProps>;
    props: ResetPasswordProps;
    subject: string;
  };
  verifyEmail: {
    component: React.FC<VerifyEmailProps>;
    props: VerifyEmailProps;
    subject: string;
  };
    signupWelcome: {
    component: React.FC<SignupWelcomeProps>;
    props: SignupWelcomeProps;
    subject: string;
  };
};

// central registry
const templates: Record<
  keyof TemplateMap,
  { component: React.FC<any>; subject: string }
> = {
  resetPassword: { component: ResetPassword, subject: "Reset Your Password" },
  verifyEmail: { component: VerifyEmail, subject: "Verify Your Email Address" },
   signupWelcome: {
    component: SignupWelcome,
    subject: "Welcome to Aloskill 🎉",
  },
};

// init resend client (dev)
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMail<K extends keyof TemplateMap>(
  to: string,
  template: K,
  props: TemplateMap[K]["props"]
): Promise<{ success: boolean; message: string }> {
  try {
    const { component: Template, subject } = templates[template];
    const html = render(<Template {...props} />, { pretty: true });

    // Resend Example (current)
    await resend.emails.send({
      from: "Aloskill <noreply@aloskill.com>",
      to,
      subject,
      html,
    });

    // ✅ For future AWS SES
    // const ses = new AWS.SES({ region: "us-east-1" });
    // await ses.sendEmail({
    //   Destination: { ToAddresses: [to] },
    //   Message: {
    //     Subject: { Data: subject },
    //     Body: { Html: { Data: html } },
    //   },
    //   Source: "noreply@aloskill.com",
    // }).promise();

    return { success: true, message: "Email sent successfully" };
  } catch (error: unknown) {
    console.error("sendMail error:", error);
    return { success: false, message: "Failed to send email" };
  }
}
