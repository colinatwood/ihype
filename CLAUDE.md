# iHYPE — Claude Code Instructions
# ──────────────────────────────────────────────────────────
# DROP THIS FILE into the GitHub repo root as CLAUDE.md
# Claude Code reads it on every turn — these rules are always active.

## CRITICAL: UI source of truth

**Every page's UI already exists as a .dc.html file in Claude Design.**
Claude Code must NOT invent, redesign, or guess any UI.

The workflow is:
1. Open the .dc.html file listed for the page you're implementing
2. Translate its HTML/CSS/React exactly into Next.js + Tailwind/CSS Modules
3. Wire the API endpoints listed in DESIGN_SYNC.md
4. Push — do not change layout, copy, colors, or components without a new .dc.html version

If a UI detail is unclear → ask Claude Design to clarify in the .dc.html. Never guess.

---

## Brand constants (never change these in code)

- **Contact:** admin@ihype.org (only email)
- **Site:** ihype.org (only domain)
- **Founded:** Portland, ME · 2026
- **Split:** 45% artist / 45% venue / 10% promoters / 0% iHYPE — locked in charter
- **No video** — iHYPE does not host video, live streams, or recorded video. Audio only.
- **Radio shows** — DJs can go live (audio-only) and shows auto-save for on-demand replay
- **Colors:** accent `#ff5029` · venue `#22e5d4` · promoter `#b983ff` · fan `#b983ff`
- **Fonts:** Syne (display/headlines) · DM Sans (body) · JetBrains Mono (labels/mono)

---

## Page map — .dc.html → Next.js route

### Marketing / Public
| .dc.html | Route | src/app path |
|---|---|---|
| Index.dc.html | / | src/app/page.tsx |
| About.dc.html | /about | src/app/about/page.tsx |
| Beta.dc.html | /beta | src/app/beta/page.tsx |
| Charter.dc.html | /charter | src/app/charter/page.tsx |
| Legal.dc.html | /legal | src/app/legal/page.tsx |
| Privacy.dc.html | /privacy | src/app/privacy/page.tsx |
| Terms.dc.html | /terms | src/app/terms/page.tsx |
| Transparency.dc.html | /transparency | src/app/transparency/page.tsx |

### Auth & Onboarding
| .dc.html | Route | src/app path |
|---|---|---|
| Auth.dc.html | /login | src/app/auth/login/page.tsx |
| Join.dc.html | /register | src/app/auth/register/page.tsx |
| Welcome.dc.html | /welcome | src/app/welcome/page.tsx |
| Verification.dc.html | /verify | src/app/verify/page.tsx |

### Fan product
| .dc.html | Route | src/app path |
|---|---|---|
| FanHome.dc.html | /home | src/app/home/page.tsx |
| Discover.dc.html | /discover | src/app/discover/page.tsx |
| Search.dc.html | /search | src/app/search/page.tsx |
| Notifications.dc.html | /me/notifications | src/app/notifications/page.tsx |
| FanProfile.dc.html | /fans/[slug] | src/app/fans/[slug]/page.tsx |
| Tickets.dc.html | /me/tickets | src/app/tickets/page.tsx |
| Settings.dc.html | /me/settings | src/app/settings/page.tsx |

### Events
| .dc.html | Route | src/app path |
|---|---|---|
| Show.dc.html | /shows/[slug] | src/app/shows/[slug]/page.tsx |
| EventCreator.dc.html | /events/new | src/app/events/new/page.tsx |
| Payout.dc.html | /payout/[eventId] | src/app/payout/[id]/page.tsx |

### Creator / Artist
| .dc.html | Route | src/app path |
|---|---|---|
| Artist.dc.html | /artists/[slug] | src/app/artists/[slug]/page.tsx |
| DJProfile.dc.html | /artists/[slug]?role=dj | src/app/artists/[slug]/page.tsx |
| Studio.dc.html | /studio | src/app/studio/page.tsx |
| Radio.dc.html | /studio/radio | src/app/studio/radio/page.tsx |
| WebRadio.dc.html | /radio | src/app/radio/page.tsx |
| Pages.dc.html | /pages | src/app/pages/page.tsx |

### Venue & Promoter
| .dc.html | Route | src/app path |
|---|---|---|
| Venue.dc.html | /venues/[slug] | src/app/venues/[slug]/page.tsx |
| PromoterHome.dc.html | /home?role=promoter | src/app/home/page.tsx |

### Admin
| .dc.html | Route | src/app path |
|---|---|---|
| AdminDash.dc.html | /admin | src/app/admin/page.tsx |

### Error / utility
| .dc.html | Route | src/app path |
|---|---|---|
| 404.dc.html | * (not found) | src/app/not-found.tsx |
| Offline.dc.html | /offline | src/app/offline/page.tsx |

### Marketing assets (design-only, no Next.js route needed)
- Deck.dc.html — stakeholder pitch deck
- Email.dc.html — email templates
- EmailSequence.dc.html — welcome drip storyboard
- Social.dc.html — OG share card
- SocialPosts.dc.html — feed + story posts
- Screenshots.dc.html — App Store iPhone frames
- AppStoreCopy.dc.html — App Store copy
- PressKit.dc.html — brand press kit
- NotifDesigns.dc.html — iOS lock screen notifications
- LaunchChecklist.dc.html — pre-launch tracker
- Sitemap.dc.html — internal navigation hub

---

## Sync workflow

1. Check DESIGN_SYNC.md → [PENDING CHANGES] table for what needs implementing
2. For each row: open the .dc.html → translate to .tsx → wire API → push
3. Mark the row `✅ [commit SHA]` in DESIGN_SYNC.md when done
4. Run `node scripts/export-tokens.js > src/app/design-tokens.css` if DS tokens changed

## API client

`lib/api.js` — use this as the API route reference. All endpoints are listed there.
Never add a new API route without a corresponding design change in Claude Design.

## Navigation

All pages share a single nav:
- **Desktop:** fixed top bar — iHYPE logo left · Listen|Events|Pages center · Log In|Sign Up right
- **Mobile:** fixed bottom bar — Listen · Events · Pages with icons

Nav implementation: copy `lib/NavShell.js` + `lib/shell.css` from Claude Design.

## DO / DO NOT

| DO | DO NOT |
|---|---|
| Translate .dc.html faithfully to .tsx | Invent UI not shown in .dc.html |
| Use `var(--*)` CSS tokens from design system | Hardcode colors or type sizes |
| Wire real API to existing mock data shapes | Change data structure without design update |
| Add `admin@ihype.org` for all contact | Use any other email address |
| Keep split as 45/45/10 / 0% iHYPE | Change the revenue split in any copy |
| Use audio-only for radio/live | Add video hosting or live video |
| Reference `ihype.org` only | Use any other domain |
