# Rules — Arush Marketplace Development

These rules apply to every coding session on this project (Codex, Claude, or any other tool).

## STEP 0 — Mandatory, every single time, no exceptions
Before writing or editing ANY code:
1. Ask for the current, real content of every file you're about to touch. Never guess a hook
   name, export name, prop shape, or file path from memory or from what "usually" exists in a
   similar project.
2. If a file's exact current state is ambiguous or wasn't provided, ask — do not proceed on an
   assumption.
3. Read `architecture.md` and `design.md` (this document set) as baseline context before
   proposing any new file or pattern.

## Workflow
- **One file at a time.** Show the full proposed file, state exactly where it goes, then wait
  for explicit confirmation ("done") before moving to the next file. Never batch multiple file
  edits into one unconfirmed step.
- After every file change, state build status (pass/fail) if it can be determined, and say
  exactly what should be manually tested.
- Never silently touch a file outside the current task's stated scope.

## Do not
- Do not redesign existing UI. Extend/improve only — see design.md.
- Do not introduce Tailwind classes. This app uses inline `style={{}}` exclusively.
- Do not introduce a `"@/"` import alias. Relative imports only.
- Do not add a `src/` folder.
- Do not revert the Firebase Admin SDK to separate `PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY` env
  vars — this failed repeatedly on Vercel. Use the base64 pattern.
- Do not reintroduce Groq or Gemini for general text generation — OpenRouter is the single
  provider for all text AI calls, via `lib/aiClient.ts`. Gemini is used ONLY for image
  generation (Design Sample feature), and only if its exact current API is verified first.
- Do not touch the existing Stripe one-time $10 unlock flow while building anything else
  (including Razorpay subscriptions) — it's a separate, already-working flow.
- Do not merge Stripe and Razorpay logic. Stripe = one-time USD unlock. Razorpay = recurring INR
  subscriptions. Never cross them.
- Do not fabricate features, descriptions, or metrics for "Arush CoFounder AI" or
  "Arush Launch AI" — they are roadmap-only, not built. Don't imply otherwise anywhere in the
  Marketplace app or its marketing pages.
- Do not claim or build fake "AI self-training" (actual model fine-tuning) — the honest, real
  version implemented is prompt augmentation from real feedback data (`lib/adeelMemory.ts`).
  Never describe this as more than it is.
- Do not build enterprise features (multi-workspace, RBAC, audit logs, org dashboards) without
  a real enterprise customer request driving it. The pitch page's "Enterprise" section is
  intentionally just a contact-us signal, not a built feature.

## Verification API/library facts before using them
Third-party API shapes (especially for image generation, payment webhooks, or anything
version-sensitive) should be verified against current official documentation via search before
being hardcoded, not assumed from training data or from a prior session's possibly-incorrect
implementation. This project has had bugs from unverified API assumptions before.

## When something is broken
Follow the diagnostic pattern that has worked before in this project:
1. Get the exact symptom/error text from the user (not just "it doesn't work").
2. Check for the class of bug that has recurred here: frontend fetch URL vs actual route file
   path mismatches, AI responses wrapped in markdown fences before JSON.parse, guessed
   hook/export names.
3. Add specific `console.error` logging (not generic swallowed errors) so root cause is visible
   in terminal/Vercel logs going forward.
4. Fix the verified root cause — don't guess-and-check blindly.

## Scope discipline
This project has repeatedly been at risk of scope creep — long feature wishlists (ML pipelines,
cybersecurity scanners, admin panels, enterprise tooling, multi-product platforms) get proposed
faster than they can be safely built. When asked to "add everything" or given a very large
feature list, the correct response is to sequence it into a clearly ordered, confirmable phase
plan (see `phase.md`) — not to attempt it all in one unconfirmed pass.