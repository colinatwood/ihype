import Mux from '@mux/mux-node';
import crypto from 'crypto';

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

export function getMuxClient() {
  if (!tokenId || !tokenSecret) {
    throw new Error('Missing Mux credentials');
  }

  return new Mux({ tokenId, tokenSecret });
}

export function verifyMuxWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
