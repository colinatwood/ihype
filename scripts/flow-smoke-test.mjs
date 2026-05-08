const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

async function readResponse(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: 'manual',
    ...init
  });
  const body = await response.text();
  return { response, body };
}

async function expectStatus(path, expectedStatus, init) {
  const { response, body } = await readResponse(path, init);

  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned HTTP ${response.status}, expected ${expectedStatus}. Body: ${body.slice(0, 180)}`);
  }

  return `${path} returned ${expectedStatus}`;
}

async function expectBody(path, expectedStatus, marker, init) {
  const { response, body } = await readResponse(path, init);

  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned HTTP ${response.status}, expected ${expectedStatus}. Body: ${body.slice(0, 180)}`);
  }

  if (!body.includes(marker)) {
    throw new Error(`${path} did not include marker ${marker}. Body: ${body.slice(0, 180)}`);
  }

  return `${path} returned ${expectedStatus} with ${marker}`;
}

const jsonHeaders = { 'Content-Type': 'application/json' };
const results = [];

results.push(await expectStatus('/admin', 307));
results.push(await expectStatus('/api/admin/export/reports', 403));
results.push(
  await expectBody('/api/content-reports', 401, 'Login required', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ targetType: 'profile', targetId: 'abc123', reason: 'Smoke test' })
  })
);
results.push(
  await expectBody('/api/auth/otp/request', 400, 'Invalid request', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ identifier: 'nobody@example.com', password: 'demo12345', website: 'bot' })
  })
);
results.push(
  await expectBody('/api/shows/fake-show-id/tickets', 401, 'Fan login required', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ quantity: 1 })
  })
);
results.push(
  await expectBody('/api/support', 400, 'Invalid support request', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      type: 'login',
      subject: 'Smoke test',
      details: 'This bot-trap request should be rejected.',
      company: 'bot'
    })
  })
);

console.log(`Flow smoke checks passed for ${baseUrl}`);
for (const result of results) {
  console.log(`- ${result}`);
}
