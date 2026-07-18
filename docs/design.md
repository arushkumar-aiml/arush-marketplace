# Design System — Arush Marketplace

## Brand colors
- **Blue (primary accent):** `#2563EB` (light mode) / `#5B82FF` (dark mode)
- **Gold (secondary accent):** `#C9A227` (light mode) / `#D9B84A` (dark mode)
- **Cosmic dark (auth screens only):** `#05060A` background, used intentionally for Login/Signup
  regardless of global theme — this is a deliberate brand choice, not a bug. Glow orbs:
  blue `#4C6FFF33` top-left, gold `#C9A22733` bottom-right, `blur(40px)`.

## Theme tokens (from `lib/theme.ts`)
Two full palettes (`light` / `dark`), each with: `bgPrimary`, `bgSecondary`, `bgTertiary`,
`bgCanvas`, `border`, `textPrimary`, `textSecondary`, `textMuted`, `accentBlue`,
`accentBlueSoft`, `accentGold`, `accentGoldSoft`, `success`, `successSoft`, `danger`,
`dangerSoft`, `codeBg`, `codeText`. Always pull colors from `useTheme().colors`, never hardcode.

## Typography
Font: `'Inter', sans-serif` (loaded via Google Fonts on marketing/pitch pages; relies on system
default within the Next.js app itself unless explicitly imported).

## Component conventions
- **Border radius:** 8–12px for buttons/inputs, 12–20px for cards, up to 20px for auth cards.
- **Cards:** `1px solid ${colors.border}` border, white/`bgPrimary` background, no heavy shadows
  except the auth glass cards (`rgba(15,16,22,0.85)` + `backdrop-filter: blur(12px)`).
- **Buttons:** Primary = blue gradient (`linear-gradient(135deg, #2563EB, #4C6FFF)`) or gold
  gradient (`linear-gradient(135deg, #C9A227, #E0C158)`) depending on context — blue for main
  actions, gold for "upgrade/premium" actions. White text on both.
- **Pills/tags:** `border-radius: 999px`, `bgSecondary` background, small font (0.7–0.75rem).
- **Icons:** `lucide-react`, generally 14–20px, colored to match the accent in context.
- **Status colors:** success = green tones, "not yet validated"/caution = gold, danger = red
  (`#F87171`).

## Product logo hierarchy
- `public/logo.png` in the Next.js app = the **Arush Marketplace product logo** (NOT the parent
  Arush Labs logo — this was corrected; the app previously used the parent company logo, which
  was confusing).
- A small "Powered by Arush Labs" text line appears directly under the logo in: Sidebar,
  Login page, Signup page. Style: `fontSize: "0.62rem"–"0.7rem"`, muted color, no bold.
- The separate `arush-labs` portfolio/pitch site (a standalone HTML file, not part of the
  Next.js app) uses `logo.png` as the **parent company** logo, plus three product-specific
  logos: `marketplace-logo.png`, `cofounder-logo.png`, `launch-logo.png`.

## Pitch/portfolio page (`arush-labs/pitch.html`, standalone, not in the Next.js `public/` folder)
- Cosmic dark hero (matches app's Login/Signup exactly), white/`#F7F8FA` content sections below.
- "Our Products" section: 3 cards (Marketplace = live, blue-highlighted border + glow, links to
  the real deployed app; CoFounder AI and Launch AI = "Coming Soon" badges, no links).
- "Where things actually stand" section: honest two-column Live/Not-yet-validated split — this
  pattern (transparent status reporting) should be preserved in any future update, not replaced
  with generic marketing claims.
- "Enterprise" section: a lightweight "Contact Us" signal only — no actual multi-tenant
  enterprise features exist or should be implied.
- Team section: 2 founders only (Arush Kumar – CEO, Adeel Ahmad – CFO), centered 2-column grid.
- Community section: real social links (LinkedIn company + founder, Instagram x2, X, YouTube x2,
  GitHub, Telegram, WhatsApp) — see memory.md for the exact URLs if rebuilding this section.

## Explicit design rule
**Never redesign existing screens.** Every UI task in this project is additive/extending only.
If a new feature needs new UI, match the closest existing pattern (check a similar existing page
first) rather than introducing a new visual language.