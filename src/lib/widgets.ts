// The 8 widget types
export type WidgetType =
  | 'now_spinning'
  | 'gear_list'
  | 'influences'
  | 'press_quotes'
  | 'merch_shelf'
  | 'tour_banner'
  | 'collab_wishlist'
  | 'listening_stats';

export type NowSpinningItem = { id: string; label: string; url?: string };
export type GearItem = { id: string; name: string; category?: string; notes?: string };
export type InfluenceItem = { id: string; name: string; profileSlug?: string };
export type PressQuote = { id: string; publication: string; quote: string; url?: string };
export type MerchItem = { id: string; name: string; price?: string; imageUrl?: string; buyUrl: string };
export type CollabRole = { id: string; role: string; notes?: string };

export type WidgetData = {
  now_spinning?: { items: NowSpinningItem[] };
  gear_list?: { items: GearItem[] };
  influences?: { items: InfluenceItem[] };
  press_quotes?: { items: PressQuote[] };
  merch_shelf?: { items: MerchItem[] };
  tour_banner?: { enabled: boolean };
  collab_wishlist?: { items: CollabRole[]; openTo?: string };
  listening_stats?: { enabled: boolean };
};

export type WidgetConfig = {
  enabled: WidgetType[];
  data: WidgetData;
};

export const WIDGET_DEFS: Record<WidgetType, { label: string; description: string; profileTypes: string[] }> = {
  now_spinning:    { label: 'Now Spinning',       description: 'Pin up to 5 tracks or artists you\'re listening to right now.',            profileTypes: ['ARTIST', 'DJ'] },
  gear_list:       { label: 'Gear List',           description: 'Show your setup: synths, DAW, controllers, mics.',                        profileTypes: ['ARTIST', 'DJ'] },
  influences:      { label: 'Influences',          description: 'Share up to 10 acts that shaped your sound.',                             profileTypes: ['ARTIST', 'DJ'] },
  press_quotes:    { label: 'Press Quotes',        description: 'Highlight blurbs from press coverage.',                                   profileTypes: ['ARTIST', 'DJ', 'VENUE'] },
  merch_shelf:     { label: 'Merch Shelf',         description: 'Up to 6 merch items linking out to your store.',                          profileTypes: ['ARTIST', 'DJ'] },
  tour_banner:     { label: 'Tour Banner',         description: 'A highlight strip of your next 3 upcoming shows.',                        profileTypes: ['ARTIST', 'DJ'] },
  collab_wishlist: { label: 'Collab Wishlist',     description: 'Let other artists know what collaborators you\'re looking for.',           profileTypes: ['ARTIST', 'DJ'] },
  listening_stats: { label: 'Listening Stats',     description: 'Show fans your public genre + artist taste from iHYPE.',                  profileTypes: ['ARTIST', 'DJ', 'VENUE'] },
};

export function parseWidgetConfig(raw: string | null | undefined): WidgetConfig {
  if (!raw) return { enabled: [], data: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<WidgetConfig>;
    return {
      enabled: Array.isArray(parsed.enabled) ? parsed.enabled.filter(w => w in WIDGET_DEFS) as WidgetType[] : [],
      data: parsed.data ?? {},
    };
  } catch {
    return { enabled: [], data: {} };
  }
}
