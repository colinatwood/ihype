'use client';

import { HypeHeatmap, type HypeHeatmapCity, type HypeHeatmapVenuePing } from '@/components/HypeHeatmap';

const cities: HypeHeatmapCity[] = [
  { name: 'Chicago',   x: .55, y: .42, hype: 1247, venuesAsking: 3, hot: true },
  { name: 'Brooklyn',  x: .81, y: .42, hype: 892,  venuesAsking: 4, hot: true },
  { name: 'Austin',    x: .45, y: .74, hype: 602,  venuesAsking: 3, hot: true },
  { name: 'LA',        x: .13, y: .56, hype: 441,  venuesAsking: 2 },
  { name: 'Seattle',   x: .10, y: .28, hype: 218,  venuesAsking: 1 },
  { name: 'Nashville', x: .62, y: .58, hype: 334,  venuesAsking: 2 },
  { name: 'Denver',    x: .32, y: .44, hype: 189,  venuesAsking: 1 },
];

const venuePings: HypeHeatmapVenuePing[] = [
  { id: 'v1', name: 'Music Hall of Williamsburg', city: 'Brooklyn', capacity: 550, statusLabel: 'wants Aug 8–10',  signal: 'urgent' },
  { id: 'v2', name: 'Empty Bottle',               city: 'Chicago',  capacity: 200, statusLabel: 'open Sep',        signal: 'warm'   },
  { id: 'v3', name: 'Mohawk',                     city: 'Austin',   capacity: 520, statusLabel: 'reach out',       signal: 'new'    },
  { id: 'v4', name: 'Teragram Ballroom',          city: 'LA',       capacity: 650, statusLabel: 'holding Aug 22',  signal: 'urgent' },
];

export default function HypeMapPage() {
  return (
    <HypeHeatmap
      cities={cities}
      venuePings={venuePings}
      suggestedRoute="CHI → BKN → ATX"
    />
  );
}
