import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

let transporter: nodemailer.Transporter | null = null;

function parseSmtpSecureFlag(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function isPasswordResetEmailConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

function getTransporter() {
  if (!isPasswordResetEmailConfigured()) {
    throw new Error('SMTP is not configured for password reset email delivery.');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: parseSmtpSecureFlag(env.SMTP_SECURE),
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD
            }
          : undefined
    });
  }

  return transporter;
}

type PasswordResetEmailInput = {
  email: string;
  code: string;
  name?: string | null;
  expiresInMinutes: number;
};

export async function sendPasswordResetPasscodeEmail({
  email,
  code,
  name,
  expiresInMinutes
}: PasswordResetEmailInput) {
  if (!isPasswordResetEmailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[password-reset] ${email} -> ${code} (valid ${expiresInMinutes} minutes)`);
      return { mode: 'log' as const };
    }

    throw new Error('Password reset email delivery is not configured.');
  }

  const resolvedName = name?.trim() || 'there';
  const transport = getTransporter();

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'iHYPE password reset passcode',
    text: [
      `Hi ${resolvedName},`,
      '',
      `Your iHYPE password reset passcode is ${code}.`,
      `It expires in ${expiresInMinutes} minutes.`,
      '',
      'If you did not request this change, you can ignore this email.'
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#10182a;">
        <p style="margin:0 0 16px;">Hi ${resolvedName},</p>
        <p style="margin:0 0 16px;">Your iHYPE password reset passcode is:</p>
        <div style="margin:0 0 20px;padding:18px 20px;border-radius:16px;background:#10182a;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.28em;text-align:center;">
          ${code}
        </div>
        <p style="margin:0 0 12px;">It expires in ${expiresInMinutes} minutes.</p>
        <p style="margin:0;color:#5b657a;">If you did not request this change, you can safely ignore this email.</p>
      </div>
    `
  });

  return { mode: 'smtp' as const };
}
