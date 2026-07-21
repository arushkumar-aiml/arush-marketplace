# Arush Marketplace — Project Map

> Purpose: a single file that maps how pages, components, hooks, API routes, and Firestore
> collections actually connect. Read this before touching any file whose consumers aren't
> obvious. Update this file whenever a new connection is added or an old one is removed.

## Page → Components → Hooks → API routes → Firestore map

### `app/login/page.tsx`
- Uses: `components/AuthTransition.tsx`, `lib/useTheme.tsx`
- Calls: Firebase Auth directly (`signInWithEmailAndPassword`, `sendPasswordResetEmail`)
- Reads: `users/{uid}` (Firestore) to get role after login

### `app/signup/page.tsx`
- Uses: `components/AuthTransition.tsx`, `lib/useTheme.tsx`
- Calls: `useAuth().signup()` (in `lib/useAuth.tsx`) — this internally calls
  `createUserWithEmailAndPassword`, `updateProfile`, writes `users/{uid}`, calls
  `sendEmailVerification`
- Redirects to: `/verify-email`

### `app/verify-email/page.tsx`
- Uses: `lib/useAuth.tsx`, `lib/useTheme.tsx`
- Polls `auth.currentUser.reload()` every 3s, redirects to `/dashboard/{role}` once verified

### `app/dashboard/client/page.tsx`
- Uses: `components/dashboard/Sidebar.tsx`, `DashboardHeader.tsx`, `AIChatPanel.tsx`,
  `BriefPanel.tsx`
- `AIChatPanel.tsx` calls: `POST /api/scope-project` → returns `ProjectBrief`
  (`types/brief.ts`) → passed up via `onBriefGenerated` prop to this page → passed down to
  `BriefPanel.tsx` as `brief` prop
- `AIChatPanel.tsx` also writes to Firestore `adeel-trainer-logs` (client-side, allowed by
  rules since `clientId == request.auth.uid`)
- **If this page shows fake/static data instead of the real brief flow: check that
  `AIChatPanel` and `BriefPanel` are still using the `onBriefGenerated`/`brief` prop wiring
  above, not reverted to hardcoded sample data.**

### `app/dashboard/client/post/page.tsx`
- Writes directly to Firestore `projects` collection, `status: "draft"`
- No API route involved — direct Firestore write from client (allowed by rules:
  `clientId == request.auth.uid`)

### `app/dashboard/client/messages/page.tsx` and `app/dashboard/freelancer/messages/page.tsx`
- Both render: `components/dashboard/MessagesView.tsx`
- `MessagesView.tsx` uses: `lib/useConversations.tsx` (conversation list, real-time via
  Firestore `onSnapshot` on `conversations` collection, filtered by `clientId`/`freelancerId`)
- `MessagesView.tsx` also independently listens to `conversations/{id}/messages` subcollection
  (its own `onSnapshot`, not through `useConversations`)
- Sending a message: `addDoc` to `conversations/{id}/messages` + `updateDoc` on the parent
  `conversations/{id}` doc (`lastMessage`, `lastMessageAt`)
- A conversation is created only after a client accepts an application. An empty Messages list is
  expected until that happens; on 2026-07-21, the configured Firebase project had no conversation
  documents. The query uses `clientId`/`freelancerId`, which match the fields written on acceptance.

### `app/dashboard/freelancer/page.tsx`
- Uses: `components/dashboard/Sidebar.tsx`, `DashboardHeader.tsx`
- Reads Firestore `projects` where `status == "open"` directly (client-side query)
- "Apply with AI" modal calls: `POST /api/generate-proposal` with `{ project, freelancerProfile }`
  → expects `{ proposal: string }` back
- On submit: writes to `applications` collection, then writes to `conversations` collection
  (auto-creates the chat thread) — **this is the ONLY place a conversation gets created**.
  If Messages is empty, confirm a proposal was actually submitted through this exact flow,
  not just "Accept/Decline" (declining does not create a conversation).
- **If "Apply with AI" shows a JSON/parsing error: the bug is in
  `app/api/generate-proposal/route.ts` — see the Codex prompt below for the fix pattern.**

### `app/dashboard/freelancer/profile/page.tsx`
- Direct Firestore `updateDoc` on `users/{uid}` — no API route

### `app/api/scope-project/route.ts`
- Called by: `AIChatPanel.tsx` only
- Provider: per `lib/aiClient.ts` memory note — Groq first, OpenRouter fallback
- Must strip markdown fences (` ```json `) from the raw model response before `JSON.parse`

### `app/api/generate-proposal/route.ts`
- Called by: `app/dashboard/freelancer/page.tsx` ("Apply with AI" modal) only
- Same JSON-parsing risk as scope-project — verify it has the same markdown-fence-stripping
  and try/catch safety net

### `app/api/verify-payment/route.ts`
- Called by: (wherever the $10 unlock checkout success page/flow lives — confirm this file
  still exists and is linked from the frontend flow that triggers it)
- Uses: `lib/firebaseAdmin.ts` (base64-decoded service account) — writes `prd-unlocks`

### `lib/aiClient.ts`
- Central AI-calling client. Per memory: tries Groq first, OpenRouter second. Gemini reserved
  for native image generation only (not currently wired to any route as of this map's last
  update — confirm if that's changed).
- Every route that needs AI text output should call through this file, not call
  Groq/OpenRouter SDKs directly — if a route bypasses this, that's a deviation to flag.

### `lib/adeelMemory.ts`
- Adds selected user feedback into prompts (prompt augmentation only — NOT fine-tuning).
  Do not describe this as "the AI is learning/training" anywhere in UI copy or docs.

### `components/RequireRole.tsx`
- Wraps every `/dashboard/*` page. Redirects: not logged in → `/login`; not verified →
  `/verify-email`; wrong role → own dashboard.

### `components/RequireAdmin.tsx`
- Wraps `app/admin/page.tsx`. Gate: `user.email === "arushkumarsince2007@gmail.com"` only.

## Firestore collections — who reads/writes each

| Collection | Written by | Read by |
|---|---|---|
| `users` | signup flow, profile edit page | almost everywhere (auth profile) |
| `projects` | post-project page (client) | freelancer dashboard (open only), client dashboard (own) |
| `applications` | "Apply with AI" submit | (not currently displayed anywhere — freelancer/proposals page is still "Coming Soon") |
| `conversations` | "Apply with AI" submit (auto-create) | MessagesView (both roles) |
| `conversations/{id}/messages` | MessagesView send | MessagesView |
| `adeel-trainer-logs` | AIChatPanel (client-side) | nobody (server-only read, no admin UI built yet) |
| `prd-unlocks` | verify-payment route (Admin SDK) | nobody displays this yet |

## Known broken/unverified links (update as fixed)
- `app/api/generate-proposal/route.ts` — JSON parsing reportedly breaks when clicking
  "Apply with AI" (see Codex prompt below)
- Messages dashboard reportedly not showing/working — cause not yet confirmed, likely one of
  the three causes listed under the Messages section above
- `applications` collection has no display UI (Freelancer Proposals list is still
  "Coming Soon") — a freelancer cannot currently see their own submitted proposals anywhere
