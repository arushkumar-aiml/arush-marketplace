# Privacy Policy — Arush Marketplace

**Last updated:** [DATE — fill in before publishing]

**⚠️ DRAFT NOTICE:** This is a starting template based on the actual technical architecture of
Arush Marketplace. It is not legal advice. Have a qualified lawyer review this before it governs
real user data or real payments, especially given obligations under India's Digital Personal
Data Protection Act (DPDP Act) and, if you ever serve EU users, GDPR.

---

## 1. Who We Are
Arush Marketplace is operated by Arush Labs ("we," "us," "our"). This policy explains what
information we collect, how we use it, and your rights regarding it.

Contact: hello@arushlabs.com

## 2. Information We Collect

### Information you provide directly
- Account information: name, email address, password (handled entirely by Firebase
  Authentication — we never see or store your raw password ourselves)
- Profile information: role (client/freelancer), occupation, freelance work type, bio, skills,
  portfolio URL, company name, country, preferred language
- Content you create: project descriptions, proposals, messages sent to other users, feedback
  on AI-generated content (thumbs up/down and correction notes)
- Payment information: processed directly by Stripe (for the one-time PRD/scaffold unlock) and
  Stripe (for one-time unlocks and subscription payments) — we do not store card details ourselves

### Information collected automatically
- Basic usage data via Firebase (login timestamps, feature usage)
- Theme and language preference (stored in your browser's local storage, not on our servers)

## 3. How We Use Your Information
- To provide the core service: matching clients and freelancers, generating AI briefs/PRDs/
  proposals, processing payments, enabling messaging between users
- To improve Adeel AI: feedback you give (thumbs up/down, correction notes) on AI-generated
  content may be used, in aggregated/summarized form, to improve future AI responses for other
  users. We do not use this to train or fine-tune any third-party AI model — it is used as
  contextual examples in prompts, not as training data submitted to any AI provider.
- To communicate with you about your account, transactions, or platform updates
- To detect and prevent fraud or abuse

## 4. Third Parties We Share Data With
We use the following third-party service providers, each of which processes certain data on
our behalf under their own privacy/security terms:

| Provider | Purpose | Data involved |
|---|---|---|
| Firebase (Google) | Authentication, database, hosting-adjacent services | Account credentials, profile data, project/message content |
| Stripe | One-time payment processing (USD) | Payment card details, billing email |
| Stripe | Payment and subscription processing | Payment details, billing email |
| OpenRouter | AI text generation (briefs, PRDs, proposals) | The text you submit to Adeel AI (project descriptions, chat messages) — sent to OpenRouter's underlying model providers to generate a response |
| Google Gemini API | AI image generation (design samples) | PRD summary data used to generate a visual mockup |
| Vercel | Application hosting | Standard web request data |

We do not sell your personal information to third parties.

## 5. Data Retention
We retain your account data for as long as your account is active. If you delete your account,
we will delete or anonymize your personal data within a reasonable period, except where we are
required to retain records (e.g., transaction records for tax/legal compliance).

## 6. Your Rights
Depending on your location, you may have the right to: access the personal data we hold about
you, request correction of inaccurate data, request deletion of your data, object to certain
processing, or request a copy of your data in a portable format. Contact hello@arushlabs.com to
exercise these rights.

## 7. Children's Privacy
Arush Marketplace is not intended for use by anyone under the age of 18. We do not knowingly
collect personal information from minors.

## 8. Security
We rely on Firebase Authentication for secure credential handling and follow standard practices
for protecting data in transit and at rest via our infrastructure providers. No system is
perfectly secure, and we cannot guarantee absolute security.

## 9. Changes to This Policy
We may update this policy from time to time. Material changes will be communicated via the
platform or by email before they take effect.

## 10. Contact
Questions about this policy: hello@arushlabs.com
