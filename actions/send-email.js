"use server";

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not configured");
}

const resend = new Resend(resendApiKey);

/**
 * Sender configuration.
 *
 * Development:
 * onboarding@resend.dev can be used with Resend's test setup.
 *
 * Production:
 * Replace this with your verified domain email.
 */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Finova <onboarding@resend.dev>";

/**
 * Send an email using Resend.
 */
export async function sendEmail({
  to,
  subject,
  react,
}) {
  try {
    /**
     * Validate Resend configuration.
     */
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    /**
     * Validate recipient.
     */
    if (!to) {
      throw new Error("Recipient email is required");
    }

    /**
     * Validate subject.
     */
    if (!subject || !subject.trim()) {
      throw new Error("Email subject is required");
    }

    /**
     * React Email component is expected.
     */
    if (!react) {
      throw new Error("Email content is required");
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: subject.trim(),
      react,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);

      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Failed to send email:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send email",
    };
  }
}