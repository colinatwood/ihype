const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const checks = [
  { path: '/', marker: 'The Promise' },
  { path: '/login', marker: 'Sign in to iHYPE' },
  { path: '/register', marker: 'Create your account' },
  { path: '/forgot', marker: 'Reset your password' },
  { path: '/privacy', marker: 'Privacy' },
  { path: '/trust', marker: 'Trust Center' },
  { path: '/terms', marker: 'Terms' },
  { path: '/copyright', marker: 'Copyright' },
  { path: '/ticket-policy', marker: 'Ticket' },
  { path: '/community-rules', marker: 'Community' },
  { path: '/support', marker: 'Get help from iHYPE' },
  { path: '/api/health', marker: '"status":"ok"' }
];

async function runCheck({ path, marker }) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { redirect: 'manual' });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }

  if (!body.includes(marker)) {
    throw new Error(`${path} did not include expected marker "${marker}"`);
  }

  return `${path} OK`;
}

const results = [];

for (const check of checks) {
  results.push(await runCheck(check));
}

console.log(`Smoke checks passed for ${baseUrl}`);
for (const result of results) {
  console.log(`- ${result}`);
}
