#!/usr/bin/env node
/**
 * iHYPE Design Diff
 * ──────────────────────────────────────────────
 * Reads DESIGN_SYNC.md and prints all pending changes
 * so Claude Code knows exactly what to implement next.
 *
 * Usage: node scripts/design-diff.js
 */

const fs = require('fs');
const path = require('path');

const syncFile = path.join(__dirname, '..', 'DESIGN_SYNC.md');
const content = fs.readFileSync(syncFile, 'utf-8');

// Extract pending rows from the table
const pendingRe = /\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*⏳ Pending\s*\|/g;
const pending = [];
let match;
while ((match = pendingRe.exec(content)) !== null) {
  pending.push({
    id: match[1].trim(),
    page: match[2].trim(),
    change: match[3].trim(),
    api: match[4].trim(),
  });
}

if (pending.length === 0) {
  console.log('✅ No pending design changes. All synced!');
  process.exit(0);
}

console.log(`\n📋 iHYPE Design Diff — ${pending.length} pending change(s)\n`);
console.log('─'.repeat(60));

pending.forEach(item => {
  console.log(`\n[#${item.id}] ${item.page}`);
  console.log(`  Change: ${item.change}`);
  console.log(`  API:    ${item.api}`);
  console.log(`  Design: ./${item.page}`);

  // Map to Next.js route
  const routeMap = {
    'Sitemap.dc.html':      '— design nav only —',
    'Studio.dc.html':       '/studio',
    'Show.dc.html':         '/shows/[slug]',
    'FanHome.dc.html':      '/home',
    'Index.dc.html':        '/',
    'Auth.dc.html':         '/login',
    'Profile.dc.html':      '/profile',
    'Tickets.dc.html':      '/me/tickets',
    'Radio.dc.html':        '/radio',
    'Artist.dc.html':       '/artists/[slug]',
    'AdminDash.dc.html':    '/admin',
    'EventCreator.dc.html': '/events/new',
    'Payout.dc.html':       '/payout/[id]',
  };

  const route = routeMap[item.page] || '(check DESIGN_SYNC.md Page Map)';
  console.log(`  Route:  ${route}`);
});

console.log('\n' + '─'.repeat(60));
console.log('\nTo implement:');
console.log('  1. Open the .dc.html file listed above');
console.log('  2. Translate to src/app/[route]/page.tsx');
console.log('  3. Wire the API calls listed');
console.log('  4. git push origin main → auto-deploys to ihype.org');
console.log('  5. Mark ⏳ Pending → ✅ [commit SHA] in DESIGN_SYNC.md\n');
