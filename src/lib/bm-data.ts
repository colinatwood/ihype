// iHYPE Booking Matchmaker — shared data & scoring model
// Two-sided: ARTIST sees venues to play; VENUE sees artists to book.
// Coordinates are real Chicago lat/lng so the Leaflet map reads true.

export const RADII = [1, 3, 5, 10]; // miles
export const RADIUS_M = [1609, 4828, 8047, 16093]; // meters, for L.circle
export const FAN_SCALE = [0.42, 1, 1.46, 2.05]; // fan multiplier vs the 3mi base

export type Grade = 'top' | 'good' | 'caution' | 'played';

export interface Comp { geo: number; fit: number; genre: number; vel: number; }

export interface BMVenue {
  id: string; name: string; hood: string; lat: number; lng: number;
  cap: number; fans: number; grade: Grade; vel: number; fit: number; played: boolean;
  comp: Comp; reason: string; audit: string; avail: number[];
}

export interface BMCobill {
  id: string; name: string; genre: string; hood: string; lat: number; lng: number;
  overlap: number; shared: number; draw: number; lift: number; grade: Grade; vel: number;
  comp: Comp; reason: string; audit: string;
}

export interface BMArtist {
  id: string; name: string; genre: string; hood: string; lat: number; lng: number;
  fans: number; grade: Grade; vel: number; fit: number; played: boolean;
  status: string; comp: Comp; reason: string; audit: string; avail: number[];
}

export interface BMPromoter {
  id: string; name: string; kind: string; hood: string; lat: number; lng: number;
  match: number; shows: number; sell: number; roster: string; grade: Grade; vel: number;
  comp: Comp; reason: string; audit: string;
}

export interface ArtistData {
  name: string; genre: string; city: string;
  home: { lat: number; lng: number; label: string };
  center: [number, number]; zoom: number; monthly: number;
  venues: BMVenue[];
  cobills: BMCobill[];
  heat: [number, number, number][];
}

export interface VenueData {
  name: string; hood: string; cap: number;
  loc: { lat: number; lng: number; label: string };
  center: [number, number]; zoom: number; sound: string;
  artists: BMArtist[];
  promoters: BMPromoter[];
  heat: [number, number, number][];
}

export const artist: ArtistData = {
  name: 'Jordan Nore', genre: 'ALT-R&B', city: 'CHICAGO',
  home: { lat: 41.9234, lng: -87.7079, label: 'YOU · LOGAN SQUARE' },
  center: [41.905, -87.672], zoom: 12, monthly: 2140,
  venues: [
    { id:'thalia', name:'Thalia Hall', hood:'Pilsen', lat:41.8573, lng:-87.6677,
      cap:800, fans:540, grade:'top', vel:34, fit:0.88, played:false,
      comp:{geo:96, fit:88, genre:90, vel:74},
      reason:'<b>540 of your listeners</b> live within 3 mi — your densest cluster. An 800-cap room fits your current draw, and Thalia books neo-soul & alt-R&B almost monthly.',
      audit:'540 unique listeners with active HYPE on you geocode within 3 mi of Thalia Hall, and 7 of your top-50 hypers attended an alt-R&B show here in the last 90 days.',
      avail: [] },
    { id:'empty', name:'Empty Bottle', hood:'Ukrainian Village', lat:41.9008, lng:-87.6863,
      cap:400, fans:430, grade:'top', vel:28, fit:0.95, played:false,
      comp:{geo:90, fit:95, genre:82, vel:70},
      reason:'<b>430 listeners</b> within 3 mi and a near-perfect capacity fit. Empty Bottle’s booker over-indexes on artists with rising local velocity — which is you right now.',
      audit:'Your 30-day local HYPE velocity (+28%) ranks in the top 6% of unsigned alt-R&B artists in this catchment; 400-cap matches your projected paid draw of 360–440.',
      avail: [] },
    { id:'lincoln', name:'Lincoln Hall', hood:'Lincoln Park', lat:41.9255, lng:-87.6488,
      cap:500, fans:360, grade:'good', vel:19, fit:0.80, played:false,
      comp:{geo:78, fit:80, genre:76, vel:60},
      reason:'<b>360 listeners</b> on the north side cluster here. Slightly above your current draw, but a co-bill would fill it — strong room for a step-up show.',
      audit:'The Lincoln Park / Lakeview listener cluster (360 within 3 mi) has no venue you’ve played, and Lincoln Hall’s past lineups share 41% genre overlap with your profile.',
      avail: [] },
    { id:'subt', name:'Subterranean', hood:'Wicker Park', lat:41.9097, lng:-87.6773,
      cap:450, fans:300, grade:'good', vel:22, fit:0.78, played:false,
      comp:{geo:74, fit:78, genre:70, vel:66},
      reason:'<b>300 listeners</b> within 3 mi and wide-open dates. Wicker Park overlaps heavily with your Logan Square base — easy crowd to pull.',
      audit:'300 active hypers geocode within 3 mi and Subterranean has 5 open Fri/Sat slots in the next 45 days matching your availability window.',
      avail: [] },
    { id:'hideout', name:'The Hideout', hood:'West Town', lat:41.9019, lng:-87.6566,
      cap:150, fans:210, grade:'good', vel:16, fit:0.70, played:false,
      comp:{geo:70, fit:64, genre:80, vel:55},
      reason:'<b>210 listeners</b> nearby. Small, tastemaker room — undersized for your reach, but a fast sell-out here builds the story for bigger bookings.',
      audit:'The Hideout indexes high on early-curator (tasteScore) attendance, and 18 of your top-100 hypers have HYPE history with artists who broke out of this room.',
      avail: [] },
    { id:'metro', name:'Metro', hood:'Wrigleyville', lat:41.9496, lng:-87.6595,
      cap:1100, fans:280, grade:'caution', vel:12, fit:0.34, played:false,
      comp:{geo:66, fit:34, genre:72, vel:48},
      reason:'<b>280 listeners</b> in range — but 1,100 capacity is well above your current draw. Hold this one until your local base roughly doubles, or take it as support.',
      audit:'Size flag: projected paid draw (260–320) covers only ~26% of Metro’s capacity. Recommended as a support-slot target, not a headline, at your current velocity.',
      avail: [] },
    { id:'sleeping', name:'Sleeping Village', hood:'Avondale', lat:41.9389, lng:-87.7074,
      cap:280, fans:330, grade:'good', vel:25, fit:0.92, played:false,
      comp:{geo:82, fit:92, genre:74, vel:68},
      reason:'<b>330 listeners</b> within 3 mi, right next to your Logan Square core. Capacity fits almost exactly — one of your cleanest sell-out bets.',
      audit:'The Avondale/Logan cluster is your #2 density zone (330 within 3 mi) and 280-cap matches projected paid draw of 290–350 within margin.',
      avail: [] },
    { id:'promo', name:'The Promontory', hood:'Hyde Park', lat:41.7995, lng:-87.5890,
      cap:450, fans:190, grade:'played', vel:8, fit:0.62, played:true,
      comp:{geo:60, fit:62, genre:68, vel:40},
      reason:'<b>190 listeners</b> on the south side — you played here 8 months ago to a 70% house. Worth a return as the south-side cluster has grown +24% since.',
      audit:'You headlined here Oct 2025 (315 paid / 450 cap). South-side listener count has since risen from 153 to 190 within 3 mi (+24%).',
      avail: [] },
  ],
  cobills: [
    { id:'cb_velvetene', name:'Velvetene', genre:'Neo-soul', hood:'Pilsen', lat:41.8569, lng:-87.6660,
      overlap:38, shared:420, draw:520, lift:31, grade:'top', vel:24,
      comp:{geo:88, fit:90, genre:92, vel:64},
      reason:'<b>38% shared hypers</b> but a bigger room draw (520) — a co-headline lifts both bills. Neo-soul sits right next to your sound without competing for the exact same fan.',
      audit:'420 hypers follow both you and Velvetene; fanbase overlap (38%) is in the sweet spot — high enough to co-promote, low enough that each act brings net-new heads. Projected combined draw +31% vs solo.' },
    { id:'cb_marlowe', name:'Marlowe Six', genre:'Alt-R&B', hood:'Wicker Park', lat:41.9101, lng:-87.6779,
      overlap:61, shared:610, draw:300, lift:12, grade:'caution', vel:18,
      comp:{geo:74, fit:58, genre:96, vel:56},
      reason:'<b>61% overlap</b> — nearly the same crowd. Same genre, easy bill, but low net-new reach. Good for a hometown show, weak for growth.',
      audit:'610 shared hypers (61% overlap) means you largely draw the same room — minimal audience expansion. Recommended only for a low-risk hometown date, not a new-market play.' },
    { id:'cb_okra', name:'Okra Wilde', genre:'Jazz-rap', hood:'Bronzeville', lat:41.8121, lng:-87.6189,
      overlap:22, shared:240, draw:480, lift:39, grade:'top', vel:36,
      comp:{geo:80, fit:86, genre:78, vel:82},
      reason:'<b>Only 22% overlap and rising +36%</b> — mostly fresh fans. The widest net-new audience on the board; a true growth co-bill into the south side.',
      audit:'240 shared hypers (22% overlap) → 78% of Okra Wilde’s crowd is new to you. Strongest audience-expansion candidate; projected +39% combined draw with low cannibalization.' },
    { id:'cb_juno', name:'Juno Park', genre:'Dream pop', hood:'Avondale', lat:41.9392, lng:-87.7081,
      overlap:29, shared:300, draw:360, lift:26, grade:'good', vel:21,
      comp:{geo:82, fit:80, genre:70, vel:62},
      reason:'<b>29% overlap, your neighbor in Avondale</b> — adjacent dream-pop crowd, easy logistics, healthy net-new reach. A clean, low-risk growth bill.',
      audit:'300 shared hypers (29% overlap); Juno Park’s Avondale base is your #2 density zone, so co-promo is geographically efficient. Projected +26% combined draw.' },
    { id:'cb_sable', name:'Sable Rio', genre:'Future-soul', hood:'Hyde Park', lat:41.7948, lng:-87.5907,
      overlap:18, shared:170, draw:300, lift:34, grade:'good', vel:29,
      comp:{geo:64, fit:74, genre:84, vel:72},
      reason:'<b>18% overlap on the south side</b> — almost entirely new fans where you’re thin. Pair on a Promontory date to crack a market you barely reach.',
      audit:'170 shared hypers (18% overlap); 82% net-new audience concentrated south of your core. Strong fit for a market-expansion co-bill at The Promontory.' },
  ],
  heat: [
    [41.9234,-87.7079,1.0],[41.9389,-87.7074,0.9],[41.9097,-87.6773,0.85],
    [41.9008,-87.6863,0.8],[41.8573,-87.6677,0.95],[41.9255,-87.6488,0.6],
    [41.9019,-87.6566,0.55],[41.7995,-87.5890,0.4],
  ],
};

const VENUE_AVAIL: Record<string, number[]> = {
  thalia:[1,3,6], empty:[2,4], lincoln:[1,3,5], subt:[1,2,4,5,6],
  hideout:[4,6], metro:[5], sleeping:[1,3,4,6], promo:[2,5,6],
};
artist.venues.forEach(v => { v.avail = VENUE_AVAIL[v.id] || []; });

export const venue: VenueData = {
  name: 'Empty Bottle', hood:'Ukrainian Village', cap:400,
  loc: { lat:41.9008, lng:-87.6863, label:'YOUR ROOM · EMPTY BOTTLE' },
  center: [41.910, -87.690], zoom: 13, sound:'INDIE · PUNK · ELECTRONIC',
  artists: [
    { id:'jordan', name:'Jordan Nore', genre:'Alt-R&B', hood:'Logan Square', lat:41.9234, lng:-87.7079,
      fans:430, grade:'top', vel:28, fit:0.95, played:false, status:'Rising',
      comp:{geo:92, fit:95, genre:80, vel:74},
      reason:'<b>430 fans</b> hyping alt-R&B in your catchment follow Jordan — your densest untapped draw. Projected 360–440 paid fits your 400 room almost exactly.',
      audit:'430 active hypers within 3 mi of Empty Bottle have HYPE on Jordan Nore; projected paid draw (360–440) matches your 400 capacity within margin.',
      avail: [] },
    { id:'mau', name:'Mau Lwin', genre:'Bedroom pop', hood:'Wicker Park', lat:41.9097, lng:-87.6773,
      fans:380, grade:'top', vel:41, fit:0.88, played:false, status:'Spiking',
      comp:{geo:86, fit:90, genre:84, vel:88},
      reason:'<b>+41% in 30 days</b> — the fastest-rising bedroom-pop act in Wicker Park. 380 local hypers and a clean capacity fit. Book before a bigger room does.',
      audit:'30-day local HYPE velocity (+41%) ranks top 3% in your catchment; no competing venue within 5 mi has booked Mau Lwin in the past 90 days.',
      avail: [] },
    { id:'dossier', name:'Dossier', genre:'House / electronic', hood:'West Town', lat:41.8916, lng:-87.6722,
      fans:410, grade:'top', vel:9, fit:0.96, played:false, status:'Steady',
      comp:{geo:90, fit:96, genre:88, vel:50},
      reason:'<b>Best capacity fit on the board (96%)</b> and 410 local hypers. House/electronic crossover that fits your late-night Friday slots.',
      audit:'410 hypers within 3 mi; genre vector matches 88% of your last-12-month electronic lineups; projected draw 380–430 vs 400 cap.',
      avail: [] },
    { id:'veldt', name:'The Veldt Kids', genre:'Post-punk', hood:'Ukrainian Village', lat:41.8985, lng:-87.6866,
      fans:290, grade:'good', vel:33, fit:0.80, played:false, status:'Rising',
      comp:{geo:78, fit:84, genre:92, vel:80},
      reason:'<b>92% genre alignment</b> with your booking history — post-punk is your house sound. 290 local hypers and rising +33%.',
      audit:'Genre vector matches 92% of your past punk/post-punk lineups; 290 hypers within 3 mi, velocity +33% over 30 days.',
      avail: [] },
    { id:'lindens', name:'The Lindens', genre:'Indie rock', hood:'Bucktown', lat:41.9180, lng:-87.6790,
      fans:300, grade:'good', vel:18, fit:0.85, played:false, status:'Steady',
      comp:{geo:76, fit:86, genre:85, vel:64},
      reason:'<b>85% genre fit</b> and a dependable 300 draw — a safe Friday headline at your size with low downside.',
      audit:'300 hypers within 3 mi; 85% genre alignment; steady velocity (+18%) and a 78% historical sell-through at comparable rooms.',
      avail: [] },
    { id:'coyote', name:'Coyote Mile', genre:'Americana', hood:'Humboldt Park', lat:41.9016, lng:-87.7008,
      fans:340, grade:'played', vel:12, fit:0.92, played:true, status:'Steady',
      comp:{geo:82, fit:92, genre:60, vel:52},
      reason:'<b>Played here twice</b> to 80%+ houses. Reliable 340 mid-week draw, though americana sits slightly outside your usual indie/punk lineup.',
      audit:'Two prior shows at Empty Bottle (avg 82% paid). 340 hypers within 3 mi; genre alignment lower (60%) but draw history is strong.',
      avail: [] },
    { id:'sasha', name:'Sasha Quill', genre:'Hyperpop', hood:'Avondale', lat:41.9320, lng:-87.7070,
      fans:250, grade:'caution', vel:52, fit:0.64, played:false, status:'Spiking',
      comp:{geo:72, fit:64, genre:70, vel:96},
      reason:'<b>Spiking +52%</b> but draw is still small for your room. A strong support booking now locks them in before they outgrow you.',
      audit:'Velocity +52% (top 1% in catchment) but projected paid draw 230–270 fills only ~63% of your room — recommended as support, not headline.',
      avail: [] },
    { id:'brth', name:'Brth', genre:'Ambient / experimental', hood:'Noble Square', lat:41.8960, lng:-87.6620,
      fans:180, grade:'caution', vel:60, fit:0.50, played:false, status:'Early',
      comp:{geo:60, fit:50, genre:76, vel:98},
      reason:'<b>Earliest signal on the board (+60%)</b> but only 180 local hypers — a tastemaker support slot, not a headline yet. Worth watching.',
      audit:'Highest velocity on the board (+60%) driven by early-curator HYPE, but only 180 hypers within 3 mi — a watchlist / support candidate.',
      avail: [] },
  ],
  promoters: [
    { id:'pr_audiotree', name:'Audiotree Presents', kind:'Indie / live-session', hood:'West Loop', lat:41.8847, lng:-87.6500,
      match:91, shows:34, sell:0.86, roster:'Indie · alt · post-punk', grade:'top', vel:14,
      comp:{geo:84, fit:88, genre:94, vel:60},
      reason:'<b>91% lineup match</b> and 34 past shows in rooms like yours. Their roster is your house sound; 86% average sell-through de-risks a co-promote.',
      audit:'Audiotree’s last-12-month lineups overlap 94% with your genre vector; 34 prior bookings at 300–500-cap rooms averaged 86% paid. Lowest-risk partner on the board.' },
    { id:'pr_winsdale', name:'Winsdale Bookings', kind:'Punk / hardcore', hood:'Avondale', lat:41.9359, lng:-87.7088,
      match:84, shows:21, sell:0.78, roster:'Punk · hardcore · noise', grade:'good', vel:22,
      comp:{geo:80, fit:80, genre:90, vel:70},
      reason:'<b>84% match</b> on the punk/hardcore end. Builds out your heavier nights with a roster you don’t currently reach.',
      audit:'90% genre alignment on punk/hardcore; 21 prior shows averaged 78% paid. Best partner for filling your heavier weeknight slots.' },
    { id:'pr_latehour', name:'Late Hour Collective', kind:'Electronic / club', hood:'Pilsen', lat:41.8567, lng:-87.6671,
      match:72, shows:28, sell:0.81, roster:'House · techno · club', grade:'good', vel:31,
      comp:{geo:78, fit:84, genre:64, vel:80},
      reason:'<b>Rising +31%</b> and 81% sell-through on late-night club bills — opens a new revenue window after your live shows end.',
      audit:'Genre overlap lower (64%) but draws a distinct late-night crowd; 28 club nights averaged 81% paid. Recommended to extend programming past midnight, not replace live bills.' },
    { id:'pr_marquee', name:'Marquee Live', kind:'Multi-genre / large', hood:'The Loop', lat:41.8836, lng:-87.6270,
      match:54, shows:46, sell:0.74, roster:'Pop · multi-genre · large', grade:'caution', vel:8,
      comp:{geo:66, fit:42, genre:58, vel:46},
      reason:'<b>54% match</b> — high volume but oriented to bigger rooms. Their acts often overshoot your 400 cap. Useful only for support-slot routing.',
      audit:'Size mismatch: 60% of Marquee’s roster routes to 800–cap+ rooms. Genre overlap 58%. Recommended only for routing rising support acts into your room, not headline co-promotes.' },
    { id:'pr_basement', name:'Basement Tapes', kind:'DIY / emerging', hood:'Humboldt Park', lat:41.9022, lng:-87.7012,
      match:79, shows:17, sell:0.69, roster:'DIY · emerging · lo-fi', grade:'good', vel:44,
      comp:{geo:74, fit:72, genre:82, vel:90},
      reason:'<b>Fastest-rising promoter (+44%)</b> — a pipeline of emerging acts before they break. Lower sell-through now, but first dibs on tomorrow’s headliners.',
      audit:'Velocity +44% (top of the board); 82% genre alignment on emerging/DIY. Sell-through (69%) reflects early-stage acts — strategic for early access, not immediate revenue.' },
  ],
  heat: [
    [41.9234,-87.7079,0.95],[41.9097,-87.6773,0.9],[41.8916,-87.6722,0.85],
    [41.8985,-87.6866,0.7],[41.9180,-87.6790,0.75],[41.9016,-87.7008,0.8],
    [41.9320,-87.7070,0.6],[41.8960,-87.6620,0.45],
  ],
};

const ARTIST_AVAIL: Record<string, number[]> = {
  jordan:[1,2,4], mau:[1,3,5], dossier:[2,4,6], veldt:[1,2,5],
  lindens:[3,4,6], coyote:[2,5], sasha:[1,6], brth:[4,5],
};
venue.artists.forEach(a => { a.avail = ARTIST_AVAIL[a.id] || []; });

export const DATES = [
  { short:'Any',      full:'Any night' },
  { short:'Fri 6/6',  full:'Fri · Jun 6' },
  { short:'Sat 6/7',  full:'Sat · Jun 7' },
  { short:'Fri 6/13', full:'Fri · Jun 13' },
  { short:'Sat 6/21', full:'Sat · Jun 21' },
  { short:'Fri 6/27', full:'Fri · Jun 27' },
  { short:'Sat 7/5',  full:'Sat · Jul 5' },
];

export const WEIGHTS = { geo: 40, fit: 28, genre: 20, vel: 12 };

export function scoreComp(comp: Comp, w = WEIGHTS): number {
  const s = w.geo + w.fit + w.genre + w.vel || 1;
  return Math.round((comp.geo * w.geo + comp.fit * w.fit + comp.genre * w.genre + comp.vel * w.vel) / s);
}
