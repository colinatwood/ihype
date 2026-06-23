#!/usr/bin/env node
/**
 * Generates a P-256 VAPID key pair for Web Push notifications.
 *
 * Usage:
 *   node scripts/generate-vapid-keys.mjs
 *
 * Copy the output values into Cloudflare Worker secrets:
 *   echo "<value>" | wrangler secret put VAPID_PUBLIC_KEY
 *   echo "<value>" | wrangler secret put VAPID_PRIVATE_KEY
 */

const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' },
  true,
  ['deriveKey']
);

const [publicRaw, privateJwk] = await Promise.all([
  crypto.subtle.exportKey('raw', keyPair.publicKey),
  crypto.subtle.exportKey('jwk', keyPair.privateKey),
]);

const publicBase64 = Buffer.from(publicRaw).toString('base64url');
const privateBase64 = Buffer.from(privateJwk.d, 'base64').toString('base64url');

console.log('\nVAPID key pair generated successfully.\n');
console.log('Set these as Cloudflare Worker secrets:\n');
console.log(`VAPID_PUBLIC_KEY=${publicBase64}`);
console.log(`VAPID_PRIVATE_KEY=${privateBase64}`);
console.log(`VAPID_SUBJECT=mailto:hello@ihype.org`);
console.log('\nOr run:');
console.log(`  echo "${publicBase64}" | wrangler secret put VAPID_PUBLIC_KEY`);
console.log(`  echo "${privateBase64}" | wrangler secret put VAPID_PRIVATE_KEY`);
console.log(`  echo "mailto:hello@ihype.org" | wrangler secret put VAPID_SUBJECT`);
