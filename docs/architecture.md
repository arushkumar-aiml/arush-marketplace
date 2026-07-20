# Architecture — Arush Marketplace

## Stack and conventions

- **Framework:** Next.js App Router, React, TypeScript/JavaScript.
- **Layout:** root-level `app/`, `components/`, `lib/`, `types/`, `messages/`, and `docs/`; there is no `src/` folder or `@/` import alias.
- **Styling:** existing UI uses inline React styles. Keep additions consistent unless the component is intentionally redesigned.
- **Authentication and database:** Firebase Authentication, Cloud Firestore, and Firebase Admin.
- **AI text:** `lib/aiClient.ts` uses Groq first, then OpenRouter if Groq fails. Configure at least one key.
- **AI images:** Gemini is used directly by the Planning Agent design-sample route.
- **Payments:** Stripe powers the one-time code-scaffold unlock and the current subscription checkout/webhook flow.
- **Internationalization:** `next-intl` with client-side language selection; no locale URL segments.
- **Theme:** `ThemeProvider` + `useTheme()` and `lib/theme.ts` color tokens.

## Provider tree

```tsx
<ThemeProvider>
  <LocaleProvider>
    <AuthProvider>{children}</AuthProvider>
  </LocaleProvider>
</ThemeProvider>
```

## Core data collections

| Collection | Purpose |
| --- | --- |
| `users` | Firebase profile, role, plans, skills, AI credits, embeddings |
| `projects` | Client-created projects and lifecycle status |
| `applications` | Freelancer proposals and their status |
| `conversations` | Deterministic client/freelancer threads; messages are subcollections |
| `notifications` | Application and payment notifications |
| `adeel-trainer-logs` | AI feedback used for prompt-memory augmentation |
| `prd-unlocks` | Server-verified code-scaffold unlock records |

## Live application flow

1. A verified client creates an open project manually or from an Adeel AI brief.
2. The app asynchronously requests freelancer recommendations for that project.
3. A freelancer discovers open Firestore projects and can generate/send an AI proposal.
4. The client accepts or declines applications. Accepting changes the project to `in_progress`, creates a conversation, and notifies the freelancer.
5. The Planning Agent can generate clarifying questions, a PRD, an optional design sample, and a Stripe-unlocked starter scaffold.

## Important implementation files

- `lib/useAuth.tsx`: authenticated Firebase user and Firestore profile.
- `lib/firebase.ts` / `lib/firebase-admin.ts`: browser and server Firebase clients.
- `lib/aiClient.ts`: one shared text-generation client with provider fallback.
- `lib/adeelMemory.ts`: feedback-based prompt augmentation; this is not model fine-tuning.
- `components/RequireRole.tsx`: dashboard role and verification gate.
- `components/dashboard/AIChatPanel.tsx` and `BriefPanel.tsx`: project-scoping UI and Firestore project creation.
- `app/dashboard/client/page.tsx`: real client project overview.
- `app/dashboard/freelancer/page.tsx`: real open-project explorer and AI application flow.

## Security notes

Server routes that create charges or deduct credits validate Firebase ID tokens. Some AI planning routes still need the same token validation before public production release. Do not expose secrets to the browser; configure them through environment variables only.
