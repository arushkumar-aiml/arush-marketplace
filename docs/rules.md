# Rules — Arush Marketplace Development

## Before changing code

1. Read the current file and relevant Next.js documentation before editing; this repository uses Next.js 16 App Router conventions.
2. Confirm actual route paths, hook exports, TypeScript types, and Firebase collection fields rather than assuming them.
3. Keep changes within the requested scope and preserve unrelated work in the working tree.

## Architecture rules

- Use relative imports; this project has no `@/` alias and no `src/` directory.
- Existing components use inline `style={{}}`; do not introduce Tailwind selectively.
- Use `lib/aiClient.ts` for text generation. It uses Groq first and OpenRouter as a fallback. Gemini is reserved for native image generation after its current API is verified.
- Keep Firebase Admin credentials in `FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64`; never put secrets in public environment variables.
- Stripe is the implemented payment provider. Preserve route authentication, verified checkout metadata, and webhook verification.
- Use real Firestore data or explicit empty/loading states. Do not add fake project cards, dashboards, metrics, or AI claims.
- Adeel feedback memory is prompt augmentation, not fine-tuning or model training.

## Security and verification

- Validate Firebase ID tokens in any route that changes user data, spends credits, handles payment, or becomes publicly accessible.
- Verify third-party API shapes against current official documentation before adding or changing them.
- Run `npx tsc --noEmit` after TypeScript changes. Run targeted linting and a production build when the environment allows it.
- Manually test the affected happy path and failure path, especially auth, Firestore access, AI provider errors, and payment redirects.
