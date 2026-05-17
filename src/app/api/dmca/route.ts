import { NextRequest, NextResponse } from 'next/server';
import { recordAuditEvent } from '@/lib/audit';
import { readClientAddress } from '@/lib/request-meta';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; url?: string; description?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, url, description } = body;
  if (!name || !email || !url || !description) {
    return NextResponse.json({ error: 'name, email, url, and description are required.' }, { status: 400 });
  }

  const ip = readClientAddress(request);

  await recordAuditEvent({
    action: 'dmca_request',
    entityType: 'dmca',
    ipAddress: ip,
    metadata: {
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      url: String(url).slice(0, 500),
      description: String(description).slice(0, 5000)
    }
  });

  return NextResponse.json({ ok: true });
}
