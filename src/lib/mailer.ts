import { recordEmailDelivery } from '@/lib/audit';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { enqueueEmail } from '@/lib/email-queue';
import { createUnsubscribeToken } from '@/lib/unsubscribe';
import { getBaseUrl } from '@/lib/utils';

function getEmailFrom() {
  return env.EMAIL_FROM;
}

export function isSmtpEmailConfigured() {
  return false; // SMTP removed — Resend is the sole provider
}

export function isResendEmailConfigured() {
  return Boolean(env.RESEND_API_KEY && getEmailFrom());
}

export function isEmailDeliveryConfigured() {
  return isResendEmailConfigured();
}

export function getEmailDeliveryReadiness() {
  const blockers: string[] = [];

  if (!env.RESEND_API_KEY) {
    blockers.push('Set RESEND_API_KEY for transactional email.');
  }

  if (!getEmailFrom()) {
    blockers.push('Set EMAIL_FROM to a verified sender address.');
  }

  return {
    ready: blockers.length === 0,
    blockers
  };
}

type ConfiguredEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
};

/**
 * Wrapper that checks emailBounced before sending.
 * Looks up the user by userId, skips delivery if bounced.
 */
export async function sendEmailToUser(
  userId: string,
  input: ConfiguredEmailInput
): Promise<{ mode: string; skipped?: boolean }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { emailBounced: true } });
  if (user?.emailBounced) {
    return { mode: 'skipped', skipped: true };
  }
  return sendGenericEmail(input);
}

function buildUnsubscribeUrl(userId: string): string {
  return `${getBaseUrl()}/api/email/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(userId))}`;
}

/**
 * Wrapper for non-transactional (marketing / digest / nudge) email.
 *
 * - Skips delivery if the address bounced or the user turned every
 *   NotificationPreference toggle off (the one-click unsubscribe state).
 * - Appends an unsubscribe footer to the text and HTML bodies.
 * - Sets a `List-Unsubscribe` header so mail clients show a native control.
 *
 * Do NOT use this for transactional email (OTP, password reset, tickets) —
 * those must always deliver and never carry an unsubscribe link.
 */
export async function sendMarketingEmail(
  userId: string,
  input: ConfiguredEmailInput
): Promise<{ mode: string; skipped?: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      emailBounced: true,
      notificationPreference: {
        select: { newShows: true, journalPosts: true, milestones: true, weeklyDigest: true }
      }
    }
  });
  if (!user || user.emailBounced) {
    return { mode: 'skipped', skipped: true };
  }
  const prefs = user.notificationPreference;
  if (prefs && !prefs.newShows && !prefs.journalPosts && !prefs.milestones && !prefs.weeklyDigest) {
    return { mode: 'skipped', skipped: true };
  }

  const unsubscribeUrl = buildUnsubscribeUrl(userId);
  return sendGenericEmail({
    ...input,
    text: `${input.text}\n\n—\nUnsubscribe from iHYPE emails: ${unsubscribeUrl}`,
    html: `${input.html}<p style="margin-top:24px;padding-top:12px;border-top:1px solid #e3e8f0;font-family:Arial,sans-serif;font-size:12px;color:#8a93a6;">You&apos;re receiving this because you have an iHYPE account. <a href="${unsubscribeUrl}" style="color:#8a93a6;">Unsubscribe</a></p>`,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      ...input.headers
    }
  });
}

export async function sendGenericEmail(input: ConfiguredEmailInput) {
  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[generic-email] ${input.to} :: ${input.subject}`);
      return { mode: 'log' as const };
    }
    throw new Error('Email delivery is not configured.');
  }
  const provider = await sendConfiguredEmail(input);
  return { mode: provider };
}

async function sendConfiguredEmail(input: ConfiguredEmailInput) {
  const from = getEmailFrom();
  if (!from) {
    throw new Error('Email sender is not configured.');
  }

  if (!isResendEmailConfigured()) {
    throw new Error('Email delivery (Resend) is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      ...(input.headers ? { headers: input.headers } : {})
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const nestedError = payload.error;
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : nestedError && typeof nestedError === 'object' && 'message' in nestedError && typeof nestedError.message === 'string'
          ? nestedError.message
        : typeof payload.error === 'string'
          ? payload.error
          : `HTTP ${response.status}`;
    throw new Error(`Resend email delivery failed: ${message}`);
  }

  return 'resend' as const;
}

type LoginOtpEmailInput = {
  email: string;
  name?: string | null;
  otp: string;
};

export async function sendLoginOtpEmail({ email, name, otp }: LoginOtpEmailInput) {
  const resolvedName = name?.trim() || 'there';

  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[login-otp] ${email} -> ${otp}`);
      await recordEmailDelivery({ type: 'login-otp', recipient: email, status: 'LOGGED', provider: 'console' });
      return { mode: 'log' as const };
    }
    throw new Error('Email delivery is not configured for OTP delivery.');
  }

  const enqueued = await enqueueEmail('login-otp', { email, name, otp });
  if (enqueued) {
    return { mode: 'queued' as const };
  }

  try {
    const provider = await sendConfiguredEmail({
      to: email,
      subject: 'Your iHYPE sign-in code',
      text: [
      `Hi ${resolvedName},`,
      '',
      `Your iHYPE sign-in code is ${otp}.`,
      'It expires in 10 minutes. Do not share it.',
      '',
      'If you did not request this, you can safely ignore this email.'
    ].join('\n'),
      html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#10182a;">
        <p style="margin:0 0 16px;">Hi ${resolvedName},</p>
        <p style="margin:0 0 16px;">Your iHYPE sign-in code is:</p>
        <div style="margin:0 0 20px;padding:18px 20px;border-radius:16px;background:#10182a;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:0.35em;text-align:center;">
          ${otp}
        </div>
        <p style="margin:0 0 12px;">Expires in 10 minutes. Do not share this code.</p>
        <p style="margin:0;color:#5b657a;">If you did not try to sign in to iHYPE, you can safely ignore this email.</p>
      </div>
    `
    });
    await recordEmailDelivery({ type: 'login-otp', recipient: email, status: 'SENT', provider });
  } catch (error) {
    await recordEmailDelivery({
      type: 'login-otp',
      recipient: email,
      status: 'FAILED',
      provider: 'resend',
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }

  return { mode: 'resend' as const };
}

type PasswordResetEmailInput = {
  email: string;
  code: string;
  name?: string | null;
  expiresInMinutes: number;
};

type IssuedTicketEmailInput = {
  email: string;
  name?: string | null;
  showTitle: string;
  venueName?: string | null;
  eventOpensAtLabel?: string | null;
  totalChargeLabel: string;
  tickets: Array<{
    label: string;
    serializedId: string;
    verificationUrl: string;
    // QR codes are now generated in-house as `data:image/svg+xml` URLs. Most email
    // clients (Gmail, Outlook) strip data: image URIs, so the email skips embedding
    // them and links to the hosted ticket page (which renders the QR) instead.
    qrCodeDataUrl?: string | null;
  }>;
};

export async function sendPasswordResetPasscodeEmail({
  email,
  code,
  name,
  expiresInMinutes
}: PasswordResetEmailInput) {
  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[password-reset] ${email} -> ${code} (valid ${expiresInMinutes} minutes)`);
      await recordEmailDelivery({ type: 'password-reset', recipient: email, status: 'LOGGED', provider: 'console' });
      return { mode: 'log' as const };
    }

    throw new Error('Password reset email delivery is not configured.');
  }

  const resolvedName = name?.trim() || 'there';

  try {
    const provider = await sendConfiguredEmail({
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
    await recordEmailDelivery({ type: 'password-reset', recipient: email, status: 'SENT', provider });
  } catch (error) {
    await recordEmailDelivery({
      type: 'password-reset',
      recipient: email,
      status: 'FAILED',
      provider: 'resend',
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }

  return { mode: 'resend' as const };
}

export async function sendIssuedTicketEmail({
  email,
  name,
  showTitle,
  venueName,
  eventOpensAtLabel,
  totalChargeLabel,
  tickets
}: IssuedTicketEmailInput) {
  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[ticket-email] ${email} -> ${showTitle} (${tickets.length} ticket${tickets.length === 1 ? '' : 's'})`
      );
      await recordEmailDelivery({ type: 'ticket', recipient: email, status: 'LOGGED', provider: 'console' });
      return { mode: 'log' as const };
    }

    throw new Error('Ticket email delivery is not configured.');
  }

  const resolvedName = name?.trim() || 'there';
  const ticketLines = tickets
    .map((ticket) => `${ticket.label}: ${ticket.serializedId} | ${ticket.verificationUrl}`)
    .join('\n');

  try {
    const provider = await sendConfiguredEmail({
      to: email,
      subject: `iHYPE tickets for ${showTitle}`,
      text: [
      `Hi ${resolvedName},`,
      '',
      `Your ticket${tickets.length === 1 ? ' is' : 's are'} ready for ${showTitle}.`,
      venueName ? `Venue: ${venueName}` : null,
      eventOpensAtLabel ? `Event time: ${eventOpensAtLabel}` : null,
      `Charge: ${totalChargeLabel}`,
      '',
      'Ticket details:',
      ticketLines,
      '',
      'Present the QR-coded ticket at entry. Each ticket is single-use.'
    ]
      .filter(Boolean)
      .join('\n'),
      html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#10182a;">
        <p style="margin:0 0 16px;">Hi ${resolvedName},</p>
        <p style="margin:0 0 16px;">Your ticket${tickets.length === 1 ? ' is' : 's are'} ready for <strong>${showTitle}</strong>.</p>
        <div style="margin:0 0 18px;padding:16px 18px;border-radius:18px;background:#10182a;color:#ffffff;">
          ${venueName ? `<p style="margin:0 0 8px;"><strong>Venue:</strong> ${venueName}</p>` : ''}
          ${eventOpensAtLabel ? `<p style="margin:0 0 8px;"><strong>Event time:</strong> ${eventOpensAtLabel}</p>` : ''}
          <p style="margin:0;"><strong>Charge:</strong> ${totalChargeLabel}</p>
        </div>
        <div style="display:grid;gap:14px;">
          ${tickets
            .map(
              (ticket) => `
                <div style="padding:16px 18px;border-radius:18px;border:1px solid #d6deea;background:#f8fbff;">
                  <p style="margin:0 0 8px;font-weight:700;">${ticket.label}</p>
                  <p style="margin:0 0 8px;"><strong>ID:</strong> ${ticket.serializedId}</p>
                  <p style="margin:0 0 12px;"><a href="${ticket.verificationUrl}" style="color:#1f6feb;">View ticket &amp; QR code</a></p>
                  ${ticket.qrCodeDataUrl && !ticket.qrCodeDataUrl.startsWith('data:') ? `<img src="${ticket.qrCodeDataUrl}" alt="QR code for ${ticket.label}" style="width:160px;height:160px;border-radius:14px;border:1px solid #d6deea;background:#ffffff;padding:8px;" />` : ''}
                </div>
              `
            )
            .join('')}
        </div>
        <p style="margin:18px 0 0;color:#5b657a;">Present the QR-coded ticket at entry. Each ticket is single-use.</p>
      </div>
    `
    });
    await recordEmailDelivery({ type: 'ticket', recipient: email, status: 'SENT', provider });
  } catch (error) {
    await recordEmailDelivery({
      type: 'ticket',
      recipient: email,
      status: 'FAILED',
      provider: 'resend',
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }

  return { mode: 'resend' as const };
}
