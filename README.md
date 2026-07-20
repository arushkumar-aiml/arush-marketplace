# Arush Marketplace

Arush Marketplace is an AI-assisted freelance marketplace built with **Next.js 16**, **React 19**, **TypeScript/JavaScript**, Firebase, Stripe, and Gemini. Clients turn an idea into a scoped brief and PRD; freelancers discover real open projects and submit AI-assisted proposals.

## What works today

- Email/password authentication, email verification, onboarding, and client/freelancer roles.
- Client project creation through a manual form or Adeel AI project scoping.
- Real Firestore-backed client projects, freelancer discovery, applications, accept/decline actions, notifications, and conversations.
- Adeel AI project briefs, clarifying questions, PRDs, proposals, code scaffolds, and design samples.
- AI provider resilience: Groq is used first when configured, with OpenRouter as a fallback for text generation.
- Semantic freelancer search/recommendations, profile embeddings, pricing guidance, themes, client-side language switching, and Stripe checkout flows.

## Main workflow

```text
Client idea → Adeel AI brief → Project published as open
          → Freelancer discovers project → AI proposal → Application
          → Client accepts → Conversation + in-progress project
```

The Planning Agent is an optional deeper flow:

```text
AI brief → Clarifying questions → PRD → Stripe unlock → Code scaffold / design sample
```

## Tech stack

| Area | Technology |
| --- | --- |
| App | Next.js App Router, React, TypeScript/JavaScript |
| Database and auth | Firebase Authentication, Cloud Firestore, Firebase Admin |
| AI text | Groq with OpenRouter fallback |
| AI imagery | Gemini image generation |
| Payments | Stripe Checkout and webhooks |
| UI | Inline React styles, Framer Motion, Lucide icons |

## Run locally

Use Node.js 20+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. On Windows PowerShell, if script execution blocks npm, use:

```bash
npm.cmd run dev
```

## Environment variables

Create `.env.local` and keep it out of Git.

```bash
# Firebase browser SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin: base64-encoded service-account JSON
FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64=

# AI text: configure at least one; both enables fallback
GROQ_API_KEY=
OPENROUTER_API_KEY=

# Gemini image generation
GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CLIENT_PRO_PRICE_ID=
STRIPE_FREELANCER_PRO_PRICE_ID=
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=
```

Never expose server-only keys with a `NEXT_PUBLIC_` prefix or commit them to the repository.

## Useful commands

```bash
npm run dev       # Start the development server
npm run build     # Production build
npm run start     # Serve a production build
npm run lint      # Run ESLint
npx tsc --noEmit  # Type-check without emitting files
```

## Project structure

```text
app/           Pages and route handlers
components/    Shared UI and dashboard components
lib/           Firebase, AI, authentication, credits, ML helpers
types/         Shared TypeScript data models
messages/      Client-side translation dictionaries
docs/          Architecture, decisions, status, and product notes
```

## Security and deployment checklist

Before production, configure Firestore security rules, Stripe webhooks, production Firebase domains, and all environment variables in the deployment provider. AI and payment route handlers must be tested using non-production keys before enabling real users.

See [architecture notes](docs/architecture.md), [project status](docs/phase.md), and [engineering memory](docs/memory.md) for implementation details and known follow-up work.
