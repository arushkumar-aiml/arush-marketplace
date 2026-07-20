# PRD — Arush Marketplace

## Company
**Arush Labs** — parent company, positioning itself as building a portfolio of AI-native
products, not just one app.

**Founders:** Arush Kumar (CEO), Adeel Ahmad (CFO)

**Mission:** Building AI for the Real World.

## Products Under Arush Labs
1. **Arush Marketplace** — LIVE. The product this PRD covers.
2. **Arush CoFounder AI** — ROADMAP ONLY, not built. Validates a startup idea and builds a
   business plan / pitch deck.
3. **Arush Launch AI** — ROADMAP ONLY, not built. Helps take a new startup to market (GTM
   strategy, roadmap, marketing plan).

Do not build CoFounder AI or Launch AI features inside the Marketplace codebase unless
explicitly asked — they are separate future products, currently only referenced on the
company pitch page (arush-labs portfolio site) as "Coming Soon."

## One-liner
An AI-native freelance marketplace where an AI agent (Adeel AI) turns a client's plain-language
project idea into a scoped brief, a full PRD with milestones and tech stack, and — for $10 — an
AI-generated starter code scaffold, before a freelancer is even matched.

## Problem
- Clients posting freelance projects often don't know how to scope their own project: realistic
  budget, timeline, required skills, or technical plan.
- This causes mismatched expectations, underpriced projects, and freelancers wasting time on
  unclear briefs.
- Freelancers spend significant unpaid time writing custom proposals for every project they
  apply to.

## Solution
1. **Adeel AI Brief Generator** — client describes their idea in a chat; AI returns a
   structured brief (overview, budget range, timeline, required skills).
2. **Adeel AI Planning Agent** — asks clarifying questions, then generates a full PRD (goals,
   scope, milestones, tech stack, risks).
3. **$10 Code Scaffold Unlock** — one-time paid unlock (Stripe) generates AI starter code files
   + setup instructions based on the PRD.
4. **AI Design Sample** — generates a visual concept/mockup based on the PRD (currently being
   debugged — see memory.md for known issues).
5. **AI Proposal Generator** (freelancer side) — freelancers get an AI-drafted, personalized
   proposal (editable) instead of writing from scratch.
6. **Adeel AI Assistant for Freelancers** — general-purpose chat for career/rate/profile advice
   (separate from the per-project proposal generator).
7. Standard marketplace mechanics: project posting, freelancer matching (skill-based %),
   accept/decline, applications, real-time messaging.

## Business Model — Pricing (current implementation uses Stripe)

| | Free | Pro | Premium |
|---|---|---|---|
| Price (Freelancer) | ₹0 | ₹299/mo | ₹1,999/mo |
| Price (Client) | ₹0 | ₹399/mo | ₹2,999/mo |
| AI Credits/month | 20 | 100 | 500 (freelancer) / 1000 (client) |
| AI Design Sample | ❌ | 3/month, watermarked | Unlimited, HD, no watermark |
| Proposal/Brief Generator | Limited | Unlimited | Unlimited + priority speed |
| Search/Matching priority | Normal | Slightly boosted | Top priority |
| Analytics | ❌ | Basic | Advanced |
| Support | Community | Priority | Priority + dedicated |

Plus:
- **8% freelancer commission** on completed projects (not yet built)
- **3% client fee** on completed projects (not yet built)
- **$10 one-time PRD + code scaffold unlock** (Stripe, USD, already live)

Premium is a distinct tier a user can upgrade directly into — not "Pro + more." Store as
`plan: "free" | "pro" | "premium"` on the user profile.

## Target Market
Early-stage non-technical founders/small businesses who need to hire developers but don't know
how to write a spec — underserved by Upwork/Fiverr, which assume the client already knows what
they want.

## Competitive Angle
Not competing on freelancer supply/price (Upwork/Fiverr have that locked). Competing on
**reducing the cost of a bad spec** — the AI does the product-thinking work a client can't do
themselves. This is the core differentiator; everything else (freelancer directory, messaging,
notifications) is "hygiene," not differentiation — competitors can copy those easily.

## What's Actually Validated vs. Assumed
**Validated:** The AI brief/PRD generation and $10 payment flow work technically end-to-end.

**NOT validated (as of last check):** Whether real clients will pay $10 for a code scaffold
before hiring anyone (no real paying customers yet). Whether AI-generated briefs/PRDs are more
useful than a client describing their project directly. Whether freelancers prefer AI-drafted
proposals. Willingness to pay ₹299–₹2,999 subscriptions. Retention — no real usage data yet.

**Getting real user feedback is a higher priority than adding new features at this stage.**

## Target Launch
20 August 2026.
