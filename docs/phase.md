# Phases — Arush Marketplace

Status as of the last known state. Update this file as tasks complete or new ones are added —
it should always reflect current reality, not the original plan.

## ✅ Done (built, and believed working unless flagged below)
- Firebase Auth (email/password) + Firestore profiles
- Link-based email verification (`app/verify-email/page.tsx`, `RequireRole` gate)
- Signup collects: name, email, password, role, occupation, freelance work type (if freelancer)
- Role-based dashboards (client / freelancer), theme-aware (dark/light)
- i18n: 17 languages, client-side switching, `next-intl`
- AI Brief Generator (client chat → structured brief)
- AI Planning Agent → full PRD (goals, scope, milestones, tech stack, risks)
- $10 Stripe one-time unlock → AI code scaffold generation
- AI Proposal Generator (freelancer, per-project "Apply with AI")
- Client Projects list page (view own projects, review/accept/decline applications)
- Freelancer Proposals list page (track sent proposals, filter by status)
- Shared Settings page (both roles): profile edit, language, password change
- Real-time Messaging (`MessagesView`, conversations + messages Firestore collections)
- Admin panel shell (`RequireAdmin`, `/admin`, real Firestore counts)
- All AI text generation consolidated onto OpenRouter (`lib/aiClient.ts`)
- Self-improving prompts via real feedback data (`lib/adeelMemory.ts`)
- Standalone `arush-labs` portfolio/pitch site (3-product showcase, real social links, honest
  "live vs not-yet-validated" status section)

## 🔧 In progress / known broken (fix before building more on top)
- **AI Design Sample (Gemini image generation)** — implemented but likely using an unverified/
  incorrect Gemini API endpoint. Needs verification against current Gemini docs, or fallback to
  a text-based design spec if image generation proves unreliable.
- **Proposal generation bug** — "Apply with AI" reportedly not generating proposals; root cause
  not yet confirmed (check for the endpoint-mismatch pattern first, per rules.md).
- **Email verification resend messaging** — shows a confusing "Couldn't send" message even in
  cases that may not be genuine failures; needs clearer success/rate-limit messaging.
- **Razorpay subscriptions (Pro/Premium, 4 plans)** — prompted for, not confirmed complete.
  Depends on: Razorpay Plan IDs created in dashboard, webhook endpoint configured, Firestore
  `subscriptions` collection rules added.
- **Credit system (Phase 1 of the pricing rebuild)** — `aiCredits` + `plan` fields on user
  profile, `lib/creditSystem.ts` deduction logic — proposed, not confirmed built.
- **Model routing (Gemini vs Groq/OpenRouter by task type)** — proposed as a cost-optimization
  layer; superseded by the OpenRouter consolidation decision — re-evaluate whether this is still
  wanted before building, since "single provider" and "route by task type" are somewhat in
  tension.

## 📋 Not started
- Freelancer directory (client-facing, browse freelancers by category)
- Signup form category/occupation was added; broader "community/credits for social follows"
  onboarding flow not built
- Real notification system (bell icon is currently decorative)
- Adeel AI general assistant for freelancers (separate from per-project proposal generator)
- Unread/All/Sent filters on Messages
- PWA setup (installable app, manifest + service worker)
- GitHub OAuth login (drafted earlier, never confirmed working end-to-end)
- Phone number OTP login (Firebase console enabled, no UI built)
- 8% freelancer commission / 3% client fee collection logic
- Admin panel expansion: user/project/freelancer management, revenue dashboard, AI usage
  analytics, community analytics, content management, audit logs
- Subscription dashboard + three-column Free/Pro/Premium upgrade modal
- AI Product Preview / Design Sample at full scoped ambition (multiple style options, PDF
  export, etc.) — current Design Sample is a smaller first slice of this idea

## Suggested near-term order
1. Fix the 3 known-broken items above (Design Sample, proposal generation, verify-email
   messaging) — these are active bugs undermining already-built features.
2. Finish Razorpay subscriptions end-to-end (this is real revenue infrastructure).
3. Get the product in front of 5–10 real users — validation matters more than new features
   right now (see prd.md "What's Actually Validated").
4. Only after real user feedback: prioritize the remaining 📋 list based on what users actually
   ask for, not the full wishlist at once.