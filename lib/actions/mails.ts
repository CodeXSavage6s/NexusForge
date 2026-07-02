import "server-only";

import path from "path";
import nodemailer from "nodemailer";
import {
  verificationEmailHtml,
  welcomeEmailHtml,
  passwordResetEmailHtml,
} from "./email-templates";

// Path to the logo file used as the inline (cid) image in every email.
// SVG is NOT used here because many email clients (Outlook, some Gmail
// contexts) don't render SVG reliably. logo.png was generated from your
// logo.svg. Put logo.png at <project-root>/public/logo.png, or update
// this path to wherever you keep it.
const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
}) {
  const { SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    throw new Error("Missing SMTP_USER, SMTP_PASS, or FROM_EMAIL");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

// The logo attachment shared by every branded email below. Nodemailer
// embeds this inline and the template refers to it via `cid:logo`.
const logoAttachment = {
  filename: "logo.png",
  path: LOGO_PATH,
  cid: "logo",
};

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
  expiresInMinutes,
}: {
  to: string;
  name?: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}) {
  const html = verificationEmailHtml({ name, verificationUrl, expiresInMinutes });
  await sendEmail({
    to,
    subject: "Verify your email address",
    text: `Verify your email address by visiting: ${verificationUrl}`,
    html,
    attachments: [logoAttachment],
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  loginUrl,
}: {
  to: string;
  name?: string;
  loginUrl: string;
}) {
  const html = welcomeEmailHtml({ name, loginUrl });
  await sendEmail({
    to,
    subject: "Welcome aboard!",
    text: `Welcome! Your account is ready. Visit: ${loginUrl}`,
    html,
    attachments: [logoAttachment],
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes,
}: {
  to: string;
  name?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}) {
  const html = passwordResetEmailHtml({ name, resetUrl, expiresInMinutes });
  await sendEmail({
    to,
    subject: "Reset your password",
    text: `Reset your password by visiting: ${resetUrl}`,
    html,
    attachments: [logoAttachment],
  });
}
