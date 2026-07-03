import { db } from '@/lib/db';
import { sendGenericEmail } from '@/lib/mailer';

type LoginUser = {
  id: string;
  email: string | null;
  name: string | null;
  lastLoginCountry: string | null;
};

// Alerts a user by email when a login comes from a different country than
// their last known login, then records the new country/timestamp. Called
// from every real sign-in path (magic link, passkey) — there is no
// password/OTP path left to also wire this into.
export async function checkAndRecordLogin(user: LoginUser, request: Request) {
  const currentCountry = request.headers.get('cf-ipcountry');

  if (currentCountry && user.lastLoginCountry && user.lastLoginCountry !== currentCountry && user.email) {
    const userName = user.name?.trim() || user.email;
    sendGenericEmail({
      to: user.email,
      subject: 'New login from a different country — iHYPE',
      text: [
        `Hi ${userName},`,
        '',
        `We detected a login to your iHYPE account from a new country (${currentCountry}).`,
        `Your previous login was from ${user.lastLoginCountry}.`,
        '',
        'If this was you, no action is needed.',
        'If you did not log in, remove any passkeys you do not recognize from Settings and contact admin@ihype.org.',
        '',
        '— iHYPE'
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#10182a;">
          <h2 style="margin:0 0 12px;">New login from a different country</h2>
          <p>Hi ${userName},</p>
          <p>We detected a login to your iHYPE account from <strong>${currentCountry}</strong>. Your previous login was from <strong>${user.lastLoginCountry}</strong>.</p>
          <p>If this was you, no action is needed. If you did not log in, remove any passkeys you do not recognize from Settings and contact admin@ihype.org.</p>
          <p style="color:#5b657a;font-size:12px;">— iHYPE</p>
        </div>
      `
    }).catch((e: unknown) => { console.error('[login-security] country-change email failed', e); });
  }

  db.user.update({
    where: { id: user.id },
    data: {
      lastLoginCountry: currentCountry ?? undefined,
      lastLoginAt: new Date()
    }
  }).catch((e: unknown) => { console.error('[login-security] last-login update failed', e); });
}
