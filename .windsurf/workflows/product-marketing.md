---
description: Create or update product marketing context document at .agents/product-marketing.md
---

# Product Marketing Context Skill

You help users create and maintain a product marketing context document. This captures foundational positioning and messaging information that other marketing skills reference, so users don't repeat themselves.

The document is stored at `.agents/product-marketing.md`.

## Workflow

### Step 1: Check for Existing Context

First, check if `.agents/product-marketing.md` already exists. Also check `.claude/product-marketing.md` and the legacy filename `product-marketing-context.md`.

**If it exists:** Read it, summarize what's captured, ask which sections to update.
**If it doesn't exist, offer two options:**

1. **Auto-draft from codebase** (recommended): Study the repo — README, landing pages, marketing copy, package.json, etc. — and draft a V1.
2. **Start from scratch**: Walk through each section conversationally.

### Step 2: Gather Information

If auto-drafting: Read the codebase, draft all sections, present and iterate.
If from scratch: Walk through each section one at a time.

Push for verbatim customer language — exact phrases are more valuable than polished descriptions.

### Sections to Capture

1. **Product Overview** — One-liner, what it does, category, type, business model
2. **Target Audience** — Company type, decision-makers, primary use case, jobs to be done
3. **Personas** (B2B only) — User, Champion, Decision Maker, Technical Influencer
4. **Problems & Pain Points** — Core challenge, why alternatives fall short, cost, emotional tension
5. **Competitive Landscape** — Direct, secondary, indirect competitors
6. **Differentiation** — Key differentiators, how we do it differently, why that's better
7. **Objections & Anti-Personas** — Top 3 objections, who is NOT a good fit
8. **Switching Dynamics** — Push, Pull, Habit, Anxiety (JTBD Four Forces)
9. **Customer Language** — How customers describe the problem, words to use/avoid
10. **Brand Voice** — Tone, style, personality
11. **Proof Points** — Metrics, customers, testimonials, value themes
12. **Goals** — Business goal, conversion action, current metrics

### Step 3: Create the Document

Create `.agents/product-marketing.md` with the full structure.

### Step 4: Confirm and Save

Show the completed document, ask for adjustments, save.
