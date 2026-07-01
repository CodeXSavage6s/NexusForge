import "server-only";

import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
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
  });
}