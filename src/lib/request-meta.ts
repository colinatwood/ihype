export function readClientAddress(request: Request | undefined) {
  if (!request) {
    return 'unknown';
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstAddress = forwardedFor.split(',')[0]?.trim();
    if (firstAddress) {
      return firstAddress;
    }
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}
