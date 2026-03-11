'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ActivityMapPoint, ActivityScopeCard, ScopeKey } from '@/lib/activity-stats';

type ActivityMapProps = {
  points: ActivityMapPoint[];
  scopes: ActivityScopeCard[];
};

function projectLongitude(longitude: number) {
  return ((longitude + 180) / 360) * 100;
}

function projectLatitude(latitude: number) {
  return ((90 - latitude) / 180) * 100;
}

export function ActivityMap({ points, scopes }: ActivityMapProps) {
  const [activeScope, setActiveScope] = useState<ScopeKey>('local');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const visiblePoints = useMemo(
    () => points.filter((point) => point.scopes.includes(activeScope)),
    [activeScope, points]
  );

  useEffect(() => {
    if (!visiblePoints.length) {
      setSelectedPointId(null);
      return;
    }

    if (!selectedPointId || !visiblePoints.some((point) => point.id === selectedPointId)) {
      setSelectedPointId(visiblePoints[0]?.id ?? null);
    }
  }, [selectedPointId, visiblePoints]);

  const selectedPoint = visiblePoints.find((point) => point.id === selectedPointId) ?? visiblePoints[0] ?? null;

  return (
    <section className="panel map-panel">
      <div className="map-panel-header">
        <div>
          <div className="badge">Activity Map</div>
          <h3>Zip and postal activity map</h3>
          <p className="kicker">
            Filter the network by scope to see where venues and shows are concentrated, grouped by postal area.
          </p>
        </div>
        <div className="scope-toggle">
          {scopes.map((scope) => (
            <button
              className={scope.key === activeScope ? 'scope-pill active' : 'scope-pill'}
              key={scope.key}
              onClick={() => setActiveScope(scope.key)}
              type="button"
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-layout">
        <div className="activity-map-stage" role="img" aria-label={`Activity map filtered to ${activeScope} scope`}>
          <div className="activity-map-grid" />
          {visiblePoints.map((point) => {
            const left = projectLongitude(point.longitude);
            const top = projectLatitude(point.latitude);
            const pulseSize = Math.max(16, Math.min(38, 12 + point.liveCount * 6 + point.venueCount * 4));

            return (
              <button
                aria-label={`${point.label}: ${point.venueCount} venues and ${point.showCount} shows`}
                className={point.id === selectedPointId ? 'map-marker active' : 'map-marker'}
                key={point.id}
                onClick={() => setSelectedPointId(point.id)}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${pulseSize}px`,
                  height: `${pulseSize}px`
                }}
                type="button"
              >
                <span>{point.postalCode}</span>
              </button>
            );
          })}
          <div className="map-caption">Visible postal areas: {visiblePoints.length}</div>
        </div>

        <aside className="map-detail panel">
          {selectedPoint ? (
            <>
              <div className="badge">{selectedPoint.postalCode}</div>
              <h3>{selectedPoint.city}{selectedPoint.stateRegion ? `, ${selectedPoint.stateRegion}` : ''}</h3>
              <p className="meta">{selectedPoint.country}</p>

              <div className="map-detail-stats">
                <div className="stat"><strong>{selectedPoint.venueCount}</strong>Venues</div>
                <div className="stat"><strong>{selectedPoint.showCount}</strong>Shows</div>
                <div className="stat"><strong>{selectedPoint.liveCount}</strong>Live now</div>
                <div className="stat"><strong>{selectedPoint.totalHype}</strong>Total hype</div>
              </div>

              <div className="map-detail-block">
                <h4>Venues here</h4>
                {selectedPoint.venueNames.length ? (
                  <ul className="launch-list compact">
                    {selectedPoint.venueNames.map((name) => <li key={name}>{name}</li>)}
                  </ul>
                ) : (
                  <p className="meta">No venue profiles pinned here yet.</p>
                )}
              </div>

              <div className="map-detail-block">
                <h4>Shows here</h4>
                {selectedPoint.showTitles.length ? (
                  <ul className="launch-list compact">
                    {selectedPoint.showTitles.map((title) => <li key={title}>{title}</li>)}
                  </ul>
                ) : (
                  <p className="meta">No shows pinned here yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="empty">No mapped activity exists for this scope yet.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
