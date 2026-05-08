import type { AdvertisingScope, ShowAdClip } from '@/lib/show-composer';

export const advertisingScopes: AdvertisingScope[] = ['local', 'regional', 'national', 'global'];

const adClipCatalog: Record<AdvertisingScope, ShowAdClip[]> = {
  local: [],
  regional: [],
  national: [],
  global: []
};

export function getAdvertisingClipsForScope(scope: AdvertisingScope) {
  return adClipCatalog[scope] ?? [];
}

