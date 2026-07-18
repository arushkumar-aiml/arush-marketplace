# Architecture — Arush Marketplace

## Stack
- **Framework:** Next.js (App Router), TypeScript
- **No "src" folder.** Everything is root-level: `app/`, `lib/`, `components/`, `types/`,
  `public/`, `messages/`, `scripts/`.
- **No "@/" alias.** All imports are relative (`../../lib/firebase`, etc.). Always double-check
  the exact relative depth from the file being edited — path-depth mismatches (`../` vs `../../`)
  have caused real build failures before.
- **Styling:** Inline `style={{}}` everywhere. Tailwind is installed but NOT used in components.
  Never introduce Tailwind classes into existing files.
- **Auth:** Firebase Authentication — email/password, link-based email verification.
  GitHub OAuth and phone OTP were planned but not confirmed working.
- **Database:** Firestore. Key collections: `users`, `projects`, `applications`,
  `conversations` (+ `messages` subcollection), `adeel-trainer-logs`, `prd-unlocks`,
  `subscriptions` (Razorpay-driven).
- **Firebase Admin SDK:** Uses a **base64-encoded service account** pattern —
  `FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64` decoded via `Buffer.from(..., "base64")`. Do NOT use
  separate `PROJECT_ID` / `CLIENT_EMAIL` / `PRIVATE_KEY` env vars — that approach was tried and
  repeatedly failed on Vercel. Follow this same base64 pattern for any new secrets.
- **AI provider:** OpenRouter, exclusively, via a single unified client: `lib/aiClient.ts`
  exporting `callAI({ prompt, temperature, jsonMode })`. Groq and Gemini (for text) were both
  fully removed in favor of OpenRouter. The only exception is **Gemini's native image generation
  API**, used directly (not via OpenRouter) for the AI Design Sample feature, since OpenRouter
  doesn't reliably support image generation — this integration has had bugs (see memory.md).
- **Payments:** Two providers, each with a distinct, non-overlapping job:
  - **Stripe** — the existing one-time $10 PRD/code-scaffold unlock, in USD. Do not touch this
    flow or convert it to INR.
  - **Razorpay** — all recurring subscriptions (Pro/Premium, both roles), in INR. Chosen over
    Stripe for recurring because Stripe's India recurring-payment support has RBI e-mandate
    friction; Razorpay handles UPI Autopay/e-NACH natively.
  - Never merge or cross these two flows.
- **i18n:** `next-intl`, client-side locale switching only — **no URL-based routing** (no
  `[locale]` folder segment, no route restructuring). Locale state lives in
  `lib/useLocale.tsx` (`LocaleProvider` + `useLocale()`), persisted to `localStorage`.
  Language list source of truth: `lib/data/language.ts` (`LANGUAGES` export) — don't duplicate
  this list elsewhere. Translation strings: `messages/en.json` is the source; `scripts/translate.mjs`
  generates the other language JSON files via OpenRouter (also migrated off Gemini/Groq).
- **Theme:** Dark/light via `lib/useTheme.tsx` (`ThemeProvider` + `useTheme()`), color tokens in
  `lib/theme.ts`. Every themed component reads `colors.*` — never hardcode a hex color that
  isn't theme-aware in both directions.
- **Deployment:** Vercel, personal/Hobby account (not a paid Team).

## Provider wrapping order in `app/layout.tsx`
```
<ThemeProvider>
  <LocaleProvider>
    <AuthProvider>{children}</AuthProvider>
  </LocaleProvider>
</ThemeProvider>
```

## Key existing files (do not guess their shape — always ask to read them first)
- `lib/useAuth.tsx` — `AuthProvider` + `useAuth()`, returns `{ user, profile, loading, signup }`.
  `signup()` handles create-user + Firestore profile + `sendEmailVerification`.
- `lib/useTheme.tsx` — `ThemeProvider` + `useTheme()`, returns `{ mode, colors, toggleTheme, setTheme }`.
- `lib/useLocale.tsx` — `LocaleProvider` + `useLocale()`, returns `{ locale, setLocale }`.
- `lib/firebase.ts` — exports `auth`, `db` (client SDK).
- `lib/firebaseAdmin.ts` (or `lib/firebase-admin.ts` — filename has been inconsistent across
  sessions, **always confirm the actual current filename before importing**) — exports an Admin
  SDK Firestore instance, base64 service-account pattern.
- `lib/aiClient.ts` — `callAI()`, the single AI entry point.
- `lib/adeelMemory.ts` — `getPromptMemory(category)`, pulls real thumbs-up/down feedback from
  `adeel-trainer-logs` to append to prompts (honest "self-improving prompts," not fine-tuning).
- `components/RequireRole.tsx` — role + email-verification gate for dashboard routes.
- `components/RequireAdmin.tsx` — super-admin gate (hardcoded email check) for `/admin`.
- `components/dashboard/Sidebar.tsx`, `DashboardHeader.tsx` — shared dashboard chrome.
  `DashboardHeader` takes `subtitle` / `ctaLabel` / `onCtaClick` props.
- `components/dashboard/MessagesView.tsx`, `lib/useConversations.tsx`, `types/conversation.ts` —
  real-time messaging feature.
- `types/user.ts`, `types/project.ts`, `types/application.ts`, `types/brief.ts`, `types/prd.ts` —
  check these before assuming any field exists.

## Known past failure patterns (avoid repeating)
1. **Endpoint/filename mismatches** — the PRD generation route was at
   `app/api/planning-agent/generator/route.ts` while the frontend called
   `/api/planning-agent/generate` (missing "or"). Always verify the actual file path on disk
   matches the frontend's fetch URL exactly — don't assume from the task name.
2. **Guessed hook/export names** — multiple sessions broke builds by assuming a hook's shape
   instead of reading the real file (e.g. `useAuth` export mismatches). Always read first.
3. **Firebase Admin env var approach** — separate `PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY` vars
   repeatedly failed on Vercel; the base64-single-var approach fixed it. Don't revert to the old
   pattern.
4. **Unverified third-party API endpoints** — an earlier Gemini image-generation integration
   used an endpoint/model name that may not match Gemini's actual documented API. Always verify
   third-party API shapes against current official docs (search, don't assume from memory)
   before implementing.