# Project status — Arush Marketplace

This document describes the repository as it exists after the workflow audit on 2026-07-20.

## Implemented workflows

- Firebase email/password auth, email-verification gate, onboarding, and client/freelancer roles.
- Client project scoping through Adeel AI, clarifying questions, and JSON PRD generation.
- Stripe one-time payment flow for the AI code-scaffold unlock.
- Client project review: application accept/decline, freelancer notification, and project status display.
- Proposal acceptance now creates one deterministic conversation per project/freelancer pair, marks the project `in_progress`, and enables live Firestore messaging.
- Shared settings, theme, client-side language selection, admin counts, profile embeddings, and freelancer recommendations.

## Verified implementation corrections

- The messaging view now clears stale threads, reports snapshot/send failures, and prevents duplicate sends while a request is in flight.
- The AI Design Sample route now uses Gemini's documented `models/gemini-3.1-flash-image:generateContent` endpoint and extracts images from `candidates[].content.parts[].inlineData`.

## Remaining work / not yet production-complete

- The freelancer dashboard is a static visual prototype: its search, filter, `Apply with AI`, and `Try Now` controls are not connected to Firestore or `/api/generate-proposal`. The proposal route exists, but the end-to-end UI workflow does not.
- Gemini image generation requires a live `GEMINI_API_KEY` smoke test in the deployment environment.
- Several Adeel AI routes (`scope-project`, Planning Agent, Design Sample, and scaffold) currently
  accept unauthenticated browser requests. Require Firebase ID tokens server-side before exposing
  the deployment publicly, and update each client fetch to send the token.
- Razorpay subscriptions, commission/fee collection, expanded admin management, unread message filters, phone OTP, GitHub OAuth, and a standalone freelancer AI assistant remain unfinished.
- The notification bell and several dashboard metrics are presentation-only until their corresponding data workflows are connected.

## Recommended next implementation order

1. Replace the static freelancer dashboard with a real open-project explorer and connect it to proposal generation/submission.
2. Add Firebase security rules and integration tests for proposal acceptance and conversations.
3. Run provider smoke tests with non-production keys for OpenRouter, Gemini, Firebase, and Stripe.
4. Complete subscriptions and marketplace fee collection before enabling paid production traffic.
