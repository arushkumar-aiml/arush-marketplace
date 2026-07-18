# Memory — Decisions, History, and Context

This is a running log of decisions made and why, so future sessions don't re-litigate settled
questions or repeat past mistakes. Append to this file rather than deleting old entries.

## Key decisions and why

**AI provider: OpenRouter only (not Groq, not Gemini for text).**
Started on Groq, hit a Gemini quota wall for the translation script specifically (`limit: 0`
free-tier error on `gemini-2.0-flash`), tried Groq for that script instead, then made a broader
decision to consolidate everything onto one provider (OpenRouter) for simplicity — "sirf ek hi
API" was the explicit instruction. Do not re-fragment this across multiple text providers again
without a clear reason.

**Payments: Stripe (one-time) + Razorpay (recurring), not one-or-the-other.**
Went back and forth on this multiple times (Razorpay → Stripe-for-everything → back to
Razorpay-for-subscriptions). Final settled reasoning: Stripe's India recurring-payment support
has RBI e-mandate friction that Razorpay handles natively. The $10 one-time unlock stays on
Stripe (already built, works fine for one-time USD charges). Recurring Pro/Premium subscriptions
use Razorpay. This split is intentional and final — don't propose merging them again without a
strong new reason.

**Firebase Admin: base64 service account, not separate env vars.**
The original three-separate-env-var approach (`PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY`) was
built, then reportedly failed repeatedly on Vercel in practice (likely private-key newline
escaping issues in Vercel's env var UI). A later session switched to a single base64-encoded
service account JSON blob, decoded at runtime — this is the pattern that stuck.

**Email verification: link-based, not OTP.**
Originally scoped as OTP (numeric code via a custom email-sending service), but a parallel
session built link-based verification first (Firebase's native `sendEmailVerification`) and it
became the actual shipped version. Decision: keep link-based, don't rebuild as OTP unless a
specific new reason emerges — rebuilding auth flows is high-risk for low reward at this stage.

**Product logo vs parent company logo.**
`public/logo.png` in the Next.js app was originally the Arush Labs (parent) logo, reused
everywhere. Corrected: the app IS the Arush Marketplace product, so it should show a
Marketplace-specific logo, with "Powered by Arush Labs" as a small credit line — not the
reverse. This same relationship (parent logo demoted to a credit line, product logo primary)
should apply consistently anywhere branding appears.

**"Self-improving AI" — honest scope.**
Explicitly rejected building or claiming real model fine-tuning/retraining (not feasible at this
stage, no infra for it). The real, shipped version is prompt augmentation:
`lib/adeelMemory.ts` pulls real thumbs-up/down feedback from `adeel-trainer-logs` and injects a
condensed "good examples / known mistakes" block into the PRD generation prompt. Never describe
this as more sophisticated than it is (e.g. don't call it "machine learning" or "training a
model" in marketing copy).

**Enterprise features — signal only, not built.**
Explicitly decided NOT to build multi-workspace/RBAC/org-dashboard enterprise infrastructure
pre-launch with zero users. Instead, the pitch page has a lightweight "Enterprise — Contact Us"
section as an honest roadmap signal. Do not start building real enterprise infra without a real
company asking for it.

**Team size on public materials: 2, not 4.**
Original business context listed 4 founders (Arush Kumar, Aniket, Adeel Ahmad, Abhay Shukla).
The public-facing pitch page was later corrected to show only 2 (Arush Kumar, Adeel Ahmad) per
explicit instruction. If asked to add "the founders" anywhere new, default to these 2 unless
told otherwise.

## Known past bugs (context for why certain rules.md items exist)
- **`/api/planning-agent/generate` vs `/api/planning-agent/generator`** — a naming mismatch
  between the frontend fetch URL and the actual route file (extra "or") caused silent 404s that
  surfaced as a generic "Couldn't generate the full PRD" error for an extended period before
  being found. This is the canonical example of why endpoint-path verification is now a
  standing rule.
- **Gemini translation script quota** — `gemini-2.0-flash` returned `limit: 0` free-tier quota
  errors for the i18n translation script specifically, even after retries/backoff. Root cause
  was provider/account entitlement, not a bug in the script. Resolved by moving the script off
  Gemini entirely (see AI provider decision above).
- **Gemini image generation endpoint** — the Design Sample feature's Gemini API call used an
  endpoint (`v1beta/interactions`) and model name (`gemini-3.1-flash-image`) that may not match
  Gemini's actual current documented image-generation API. Flagged as needing verification
  against live docs, not fixed by assumption.

## Company/social reference info (for any future marketing material)
- Social handles: LinkedIn company `arush-labs`, LinkedIn founder `arushkumar9983`, Instagram
  founder `arushkumar9983`, Instagram company `arushlabs`, X `arushkumar9983`, YouTube founder
  `@ArushLabs`, YouTube team `@ArushLabsTeam`, GitHub org `ArushLabs`, Telegram `arushlabs`,
  WhatsApp Channel (see the pitch page for the current invite link — these rotate).
- Live app URL: `https://arush-marketplace.vercel.app`
- Contact email used on marketing materials: `hello@arushlabs.com`

## Open questions not yet resolved
- Model routing by task type (Gemini vs Groq/OpenRouter) was proposed as a cost-optimization
  idea but conflicts with the "single provider" decision above — needs an explicit re-decision
  before building, not a silent implementation.
- Whether "Arush CoFounder AI" and "Arush Launch AI" will ever be built inside this same
  codebase/repo or as fully separate projects has not been decided.