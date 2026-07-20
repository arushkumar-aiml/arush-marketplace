# Arush Marketplace

An AI-assisted freelance marketplace built with Next.js, Firebase, OpenRouter, Stripe, and Gemini image generation.

## Core workflow

1. Sign up, verify email, and complete onboarding as a client or freelancer.
2. A client describes a project to Adeel AI and receives a structured scope.
3. The Planning Agent asks clarifying questions and generates a PRD.
4. A client may unlock an AI code scaffold through the existing Stripe checkout flow.
5. When a client accepts a proposal, the project moves to `in_progress`, a conversation is created, and both parties can use real-time Firestore chat.

## Local setup

Use Node.js 20 or later.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. If PowerShell blocks `npm.ps1`, use `npm.cmd run dev`.

## Required environment variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

`FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64` is base64-encoded Firebase service-account JSON. Never commit real credentials.

## Verification

```bash
npm run lint
npm run build
```

The AI Design Sample needs a live Gemini key for an end-to-end check. See [docs/architecture.md](docs/architecture.md) and [docs/phase.md](docs/phase.md) for implementation details and known remaining work.
