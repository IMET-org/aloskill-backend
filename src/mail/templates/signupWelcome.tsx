// src/mail/templates/SignupWelcome.tsx
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

export interface SignupWelcomeProps {
  username: string;
  dashboardLink: string;
}

export default function SignupWelcome({
  username,
  dashboardLink,
}: SignupWelcomeProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Aloskill 🎉</Preview>
      <Body style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '500px',
          }}
        >
          <Heading style={{ color: '#111827', fontSize: '22px' }}>Welcome, {username}! 🎉</Heading>

          <Text style={{ fontSize: '14px', color: '#374151' }}>
            We’re excited to have you on <b>Aloskill</b>. Start exploring courses, manage your
            learning, and build your skills with us.
          </Text>

          <Button
            href={dashboardLink}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '16px',
            }}
          >
            Go to Dashboard
          </Button>

          <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '20px' }}>
            If you didn’t create an Aloskill account, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
