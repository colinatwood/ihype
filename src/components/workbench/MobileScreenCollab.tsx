'use client';

import React from 'react';
import type { WorkbenchData } from '@/types/workbench';
import ViewCollabBoard from './ViewCollabBoard';

// ─── Screen: Collab Board (mobile wrapper) ────────────────────
export function MobileScreenCollab({ data }: { data: WorkbenchData }) {
  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <ViewCollabBoard data={data} />
    </div>
  );
}
