'use client';
import { useState, useRef, useEffect } from 'react';
import type {
  WidgetConfig,
  WidgetType,
  WidgetData,
  NowSpinningItem,
  GearItem,
  InfluenceItem,
  PressQuote,
  MerchItem,
  CollabRole,
} from '@/lib/widgets';
import { WIDGET_DEFS } from '@/lib/widgets';

export type WidgetManagerProps = {
  profileId: string;
  profileType: string;
  initialConfig: WidgetConfig;
};

// ─── shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: '6px 9px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'inherit',
  borderRadius: 5,
  fontSize: '0.82rem',
  fontFamily: 'inherit',
  flex: 1,
  minWidth: 0,
};

const addItemBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px dashed rgba(255,255,255,0.2)',
  color: 'inherit',
  borderRadius: 5,
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  opacity: 0.6,
  marginTop: 6,
};

const removeRowBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '0 4px',
  flexShrink: 0,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  marginBottom: 4,
};

// ─── per-widget editors ───────────────────────────────────────────────────────

function NowSpinningEditor({
  items,
  onChange,
}: {
  items: NowSpinningItem[];
  onChange: (items: NowSpinningItem[]) => void;
}) {
  const add = () => {
    if (items.length >= 5) return;
    onChange([...items, { id: crypto.randomUUID(), label: '', url: '' }]);
  };
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof NowSpinningItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={rowStyle}>
          <input
            style={inputStyle}
            placeholder="Track / artist label"
            value={item.label}
            onChange={(e) => update(item.id, 'label', e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="URL (optional)"
            value={item.url ?? ''}
            onChange={(e) => update(item.id, 'url', e.target.value)}
          />
          <button style={removeRowBtnStyle} onClick={() => remove(item.id)} aria-label="Remove">×</button>
        </div>
      ))}
      {items.length < 5 && (
        <button style={addItemBtnStyle} onClick={add}>+ Add item</button>
      )}
    </div>
  );
}

function GearListEditor({
  items,
  onChange,
}: {
  items: GearItem[];
  onChange: (items: GearItem[]) => void;
}) {
  const add = () => {
    if (items.length >= 20) return;
    onChange([...items, { id: crypto.randomUUID(), name: '', category: '', notes: '' }]);
  };
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof GearItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={rowStyle}>
          <input
            style={inputStyle}
            placeholder="Name"
            value={item.name}
            onChange={(e) => update(item.id, 'name', e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Category (optional)"
            value={item.category ?? ''}
            onChange={(e) => update(item.id, 'category', e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Notes (optional)"
            value={item.notes ?? ''}
            onChange={(e) => update(item.id, 'notes', e.target.value)}
          />
          <button style={removeRowBtnStyle} onClick={() => remove(item.id)} aria-label="Remove">×</button>
        </div>
      ))}
      {items.length < 20 && (
        <button style={addItemBtnStyle} onClick={add}>+ Add item</button>
      )}
    </div>
  );
}

function InfluencesEditor({
  items,
  onChange,
}: {
  items: InfluenceItem[];
  onChange: (items: InfluenceItem[]) => void;
}) {
  const add = () => {
    if (items.length >= 10) return;
    onChange([...items, { id: crypto.randomUUID(), name: '', profileSlug: '' }]);
  };
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof InfluenceItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={rowStyle}>
          <input
            style={inputStyle}
            placeholder="Name"
            value={item.name}
            onChange={(e) => update(item.id, 'name', e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="iHYPE slug (optional)"
            value={item.profileSlug ?? ''}
            onChange={(e) => update(item.id, 'profileSlug', e.target.value)}
          />
          <button style={removeRowBtnStyle} onClick={() => remove(item.id)} aria-label="Remove">×</button>
        </div>
      ))}
      {items.length < 10 && (
        <button style={addItemBtnStyle} onClick={add}>+ Add item</button>
      )}
    </div>
  );
}

function PressQuotesEditor({
  items,
  onChange,
}: {
  items: PressQuote[];
  onChange: (items: PressQuote[]) => void;
}) {
  const add = () => {
    if (items.length >= 8) return;
    onChange([...items, { id: crypto.randomUUID(), publication: '', quote: '', url: '' }]);
  };
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof PressQuote, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: 8 }}>
          <div style={rowStyle}>
            <input
              style={inputStyle}
              placeholder="Publication"
              value={item.publication}
              onChange={(e) => update(item.id, 'publication', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="URL (optional)"
              value={item.url ?? ''}
              onChange={(e) => update(item.id, 'url', e.target.value)}
            />
            <button style={removeRowBtnStyle} onClick={() => remove(item.id)} aria-label="Remove">×</button>
          </div>
          <textarea
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 60 }}
            placeholder="Quote"
            value={item.quote}
            onChange={(e) => update(item.id, 'quote', e.target.value)}
          />
        </div>
      ))}
      {items.length < 8 && (
        <button style={addItemBtnStyle} onClick={add}>+ Add item</button>
      )}
    </div>
  );
}

function MerchShelfEditor({
  items,
  onChange,
}: {
  items: MerchItem[];
  onChange: (items: MerchItem[]) => void;
}) {
  const add = () => {
    if (items.length >= 6) return;
    onChange([...items, { id: crypto.randomUUID(), name: '', price: '', imageUrl: '', buyUrl: '' }]);
  };
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof MerchItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: 8 }}>
          <div style={rowStyle}>
            <input
              style={inputStyle}
              placeholder="Name"
              value={item.name}
              onChange={(e) => update(item.id, 'name', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Price"
              value={item.price ?? ''}
              onChange={(e) => update(item.id, 'price', e.target.value)}
            />
            <button style={removeRowBtnStyle} onClick={() => remove(item.id)} aria-label="Remove">×</button>
          </div>
          <div style={rowStyle}>
            <input
              style={inputStyle}
              placeholder="Image URL"
              value={item.imageUrl ?? ''}
              onChange={(e) => update(item.id, 'imageUrl', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Buy URL"
              value={item.buyUrl}
              onChange={(e) => update(item.id, 'buyUrl', e.target.value)}
            />
          </div>
        </div>
      ))}
      {items.length < 6 && (
        <button style={addItemBtnStyle} onClick={add}>+ Add item</button>
      )}
    </div>
  );
}

function TourBannerEditor() {
  return (
    <p style={{ fontSize: '0.82rem', opacity: 0.6, margin: 0 }}>
      Auto-populated from your upcoming shows. Enable to show on profile.
    </p>
  );
}

function CollabWishlistEditor({
  data,
  onChange,
}: {
  data: { items: CollabRole[]; openTo?: string };
  onChange: (data: { items: CollabRole[]; openTo?: string }) => void;
}) {
  const addRole = () => {
    onChange({ ...data, items: [...data.items, { id: crypto.randomUUID(), role: '' }] });
  };
  const removeRole = (id: string) =>
    onChange({ ...data, items: data.items.filter((r) => r.id !== id) });
  const updateRole = (id: string, field: keyof CollabRole, value: string) =>
    onChange({
      ...data,
      items: data.items.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    });

  return (
    <div>
      <textarea
        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 56, marginBottom: 8 }}
        placeholder="Open to… (optional description)"
        value={data.openTo ?? ''}
        onChange={(e) => onChange({ ...data, openTo: e.target.value })}
      />
      {data.items.map((role) => (
        <div key={role.id} style={rowStyle}>
          <input
            style={inputStyle}
            placeholder="Role (e.g. vocalist, mixing engineer)"
            value={role.role}
            onChange={(e) => updateRole(role.id, 'role', e.target.value)}
          />
          <input
            style={{ ...inputStyle, flex: '0 0 160px' }}
            placeholder="Notes (optional)"
            value={role.notes ?? ''}
            onChange={(e) => updateRole(role.id, 'notes', e.target.value)}
          />
          <button style={removeRowBtnStyle} onClick={() => removeRole(role.id)} aria-label="Remove">×</button>
        </div>
      ))}
      <button style={addItemBtnStyle} onClick={addRole}>+ Add role</button>
    </div>
  );
}

function ListeningStatsEditor() {
  return (
    <p style={{ fontSize: '0.82rem', opacity: 0.6, margin: 0 }}>
      Your iHYPE listening history will be shown here. No configuration needed.
    </p>
  );
}

// ─── widget card ──────────────────────────────────────────────────────────────

function WidgetCard({
  type,
  data,
  onUpdateData,
  onRemove,
}: {
  type: WidgetType;
  data: WidgetData;
  onUpdateData: (data: WidgetData) => void;
  onRemove: () => void;
}) {
  const def = WIDGET_DEFS[type];

  function renderEditor() {
    switch (type) {
      case 'now_spinning':
        return (
          <NowSpinningEditor
            items={data.now_spinning?.items ?? []}
            onChange={(items) => onUpdateData({ ...data, now_spinning: { items } })}
          />
        );
      case 'gear_list':
        return (
          <GearListEditor
            items={data.gear_list?.items ?? []}
            onChange={(items) => onUpdateData({ ...data, gear_list: { items } })}
          />
        );
      case 'influences':
        return (
          <InfluencesEditor
            items={data.influences?.items ?? []}
            onChange={(items) => onUpdateData({ ...data, influences: { items } })}
          />
        );
      case 'press_quotes':
        return (
          <PressQuotesEditor
            items={data.press_quotes?.items ?? []}
            onChange={(items) => onUpdateData({ ...data, press_quotes: { items } })}
          />
        );
      case 'merch_shelf':
        return (
          <MerchShelfEditor
            items={data.merch_shelf?.items ?? []}
            onChange={(items) => onUpdateData({ ...data, merch_shelf: { items } })}
          />
        );
      case 'tour_banner':
        return <TourBannerEditor />;
      case 'collab_wishlist':
        return (
          <CollabWishlistEditor
            data={data.collab_wishlist ?? { items: [] }}
            onChange={(val) => onUpdateData({ ...data, collab_wishlist: val })}
          />
        );
      case 'listening_stats':
        return <ListeningStatsEditor />;
    }
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '1rem',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{def.label}</span>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0 2px',
            lineHeight: 1,
          }}
          onClick={onRemove}
          aria-label={`Remove ${def.label}`}
        >
          ×
        </button>
      </div>
      {renderEditor()}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function WidgetManager({ profileId, profileType, initialConfig }: WidgetManagerProps) {
  const [enabled, setEnabled] = useState<WidgetType[]>(initialConfig.enabled);
  const [data, setData] = useState<WidgetData>(initialConfig.data);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<WidgetType | null>(null);
  const [loadedFromServer, setLoadedFromServer] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load real config from server on mount
  useEffect(() => {
    fetch(`/api/widgets/${profileId}`)
      .then(r => r.ok ? r.json() : null)
      .then((j: { config?: WidgetConfig } | null) => {
        if (j?.config) {
          setEnabled(j.config.enabled);
          setData(j.config.data);
        }
        setLoadedFromServer(true);
      })
      .catch(() => setLoadedFromServer(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  function updateData(value: WidgetData) {
    setData(value);
  }

  const availableWidgets = (Object.keys(WIDGET_DEFS) as WidgetType[]).filter(
    (type) =>
      WIDGET_DEFS[type].profileTypes.includes(profileType) && !enabled.includes(type),
  );

  function addWidget(type: WidgetType) {
    setEnabled((prev) => [...prev, type]);
    // Seed default data so editors start with empty arrays
    setData((prev) => {
      if (type === 'now_spinning' && !prev.now_spinning) return { ...prev, now_spinning: { items: [] } };
      if (type === 'gear_list' && !prev.gear_list) return { ...prev, gear_list: { items: [] } };
      if (type === 'influences' && !prev.influences) return { ...prev, influences: { items: [] } };
      if (type === 'press_quotes' && !prev.press_quotes) return { ...prev, press_quotes: { items: [] } };
      if (type === 'merch_shelf' && !prev.merch_shelf) return { ...prev, merch_shelf: { items: [] } };
      if (type === 'tour_banner' && !prev.tour_banner) return { ...prev, tour_banner: { enabled: true } };
      if (type === 'collab_wishlist' && !prev.collab_wishlist) return { ...prev, collab_wishlist: { items: [] } };
      if (type === 'listening_stats' && !prev.listening_stats) return { ...prev, listening_stats: { enabled: true } };
      return prev;
    });
    setDropdownOpen(false);
  }

  function removeWidget(type: WidgetType) {
    setEnabled((prev) => prev.filter((w) => w !== type));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/widgets/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { enabled, data } }),
      });
      if (res.ok) setStatus('Saved!');
      else setStatus('Save failed.');
    } catch {
      setStatus('Save failed.');
    }
    setBusy(false);
    setTimeout(() => setStatus(null), 3000);
  }

  if (!loadedFromServer) {
    return <div style={{ fontSize: '0.75rem', opacity: 0.4, padding: '8px 0' }}>Loading widgets…</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Add widget dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          disabled={availableWidgets.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'inherit',
            borderRadius: 6,
            cursor: availableWidgets.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            opacity: availableWidgets.length === 0 ? 0.4 : 1,
          }}
        >
          + Add widget <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▾</span>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 50,
              background: 'var(--bg-2, #1a1a1a)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              minWidth: 280,
              padding: 8,
              marginTop: 4,
            }}
          >
            {availableWidgets.map((type) => {
              const def = WIDGET_DEFS[type];
              return (
                <div
                  key={type}
                  onClick={() => addWidget(type)}
                  onMouseEnter={() => setHoveredDropdownItem(type)}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 5,
                    cursor: 'pointer',
                    background:
                      hoveredDropdownItem === type
                        ? 'rgba(255,255,255,0.06)'
                        : 'transparent',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{def.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.55, marginTop: 2 }}>{def.description}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enabled widget cards */}
      {enabled.length === 0 && (
        <p style={{ fontSize: '0.85rem', opacity: 0.45, marginTop: 4 }}>
          No widgets enabled. Click &quot;+ Add widget&quot; to get started.
        </p>
      )}

      {enabled.map((type) => (
        <WidgetCard
          key={type}
          type={type}
          data={data}
          onUpdateData={updateData}
          onRemove={() => removeWidget(type)}
        />
      ))}

      {/* Save row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button
          onClick={save}
          disabled={busy}
          style={{
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'inherit',
            borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            opacity: busy ? 0.5 : 1,
          }}
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        {status && (
          <span
            style={{
              fontSize: '0.82rem',
              color: status === 'Saved!' ? 'rgba(100,220,130,0.9)' : 'rgba(255,100,100,0.9)',
            }}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
