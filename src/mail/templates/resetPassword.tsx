// src/mail/templates/ResetPassword.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

export interface ResetPasswordProps {
  username: string;
  resetLink: string;
}

export default function ResetPassword({
  username,
  resetLink,
}: ResetPasswordProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Reset your Aloskill account password</Preview>
      <Body style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container
          style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '500px',
          }}
        >
          <Heading style={{ color: '#111827', fontSize: '20px' }}>Password Reset Request</Heading>

          <Text style={{ fontSize: '14px', color: '#374151' }}>
            Hi <b>{username}</b>,
          </Text>

          <Text style={{ fontSize: '14px', color: '#374151' }}>
            We received a request to reset your Aloskill account password. Click the button below to
            set a new password.
          </Text>

          <Button
            href={resetLink}
            style={{
              backgroundColor: '#4f46e5',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '12px',
            }}
          >
            Reset Password
          </Button>

          <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '20px' }}>
            If you didn’t request this, you can safely ignore this email. This password reset link
            will expire in 30 minutes.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
