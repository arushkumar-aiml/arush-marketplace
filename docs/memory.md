# Engineering memory — Arush Marketplace

This file records active implementation decisions so future work follows the code that actually exists.

## Active decisions

- **AI text resiliency:** `lib/aiClient.ts` tries Groq first and OpenRouter second. Keep both keys optional individually, but require at least one. Gemini is only for native image generation.
- **AI learning claim:** `lib/adeelMemory.ts` adds selected user feedback to prompts. It is prompt augmentation, not fine-tuning or model retraining.
- **Payments:** Stripe is the implemented provider for the $10 code-scaffold unlock and subscriptions. Do not represent Razorpay as an active dependency without implementation.
- **Firebase Admin credentials:** production uses `FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64`, a base64-encoded service-account JSON document. Keep server credentials out of public variables.
- **Project visibility:** freelancer discovery intentionally reads only projects with `status: "open"`. Manual and AI-created projects must stay open when they are meant to be discoverable.
- **Conversation identity:** accepted applications use the deterministic conversation ID `${projectId}_${freelancerId}` to avoid duplicate client/freelancer threads.
- **No fake dashboard data:** client and freelancer home pages must use Firestore data or explicit empty/loading states; do not add static project cards, counts, or notifications as real product content.

## Safety reminders

- Verify a route handler path matches every frontend `fetch()` call exactly.
- Check a TypeScript type and hook export before using it; import paths are relative and the repository has no alias.
- Never log or commit API keys, Firebase service-account data, Stripe secrets, or user tokens.
- Before exposing an AI route publicly, authenticate it server-side and use Firestore rules to restrict the relevant data writes.
