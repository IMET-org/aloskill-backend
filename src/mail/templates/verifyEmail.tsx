// src/mail/templates/VerifyEmail.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

export interface VerifyEmailProps {
  username: string;
  verificationLink: string;
}

export default function VerifyEmail({
  username,
  verificationLink,
}: VerifyEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Verify your Aloskill account</Preview>
      <Body style={{ backgroundColor: "#f9f9f9", padding: "20px" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          <Heading style={{ color: "#111827", fontSize: "20px" }}>
            Verify Your Email
          </Heading>

          <Text style={{ fontSize: "14px", color: "#374151" }}>
            Hi <b>{username}</b>,
          </Text>

          <Text style={{ fontSize: "14px", color: "#374151" }}>
            Thanks for signing up on <b>Aloskill</b>. Please confirm your email
            address by clicking the button below:
          </Text>

          <Button
            href={verificationLink}
            style={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "12px",
            }}
          >
            Verify Email
          </Button>

          <Text style={{ fontSize: "12px", color: "#6b7280", marginTop: "20px" }}>
            If you didn’t create an account, please ignore this email.
