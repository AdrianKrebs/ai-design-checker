---
description: Score a URL for the 16 AI design patterns common to AI-generated landing pages (slop fonts, vibe purple, gradients, perma dark, icon-card grid, numbered steps, FAQ accordion, glassmorphism, etc). Use when the user asks "score this site", "is this site templated/AI-generated?", "check for AI design patterns", "run ai-design-checker", or pastes a URL and asks how AI-templated it looks.
---

# AI Design Checker

Runs the `ai-design-checker` CLI against a URL and reports which of the 16 deterministic design patterns trigger.

## How to use

When the user asks to score, check, or analyze a URL for AI design patterns:

1. Run the CLI in JSON mode for parseable output:

   ```bash
   npx ai-design-checker <url> --json
   ```

   - The first run on a fresh machine downloads Chromium (~200 MB) via Playwright. If the CLI exits with `Could not launch Chromium`, run `npx playwright install chromium` first.
   - Each scan takes ~7 seconds. Don't fan out parallel runs.

2. Parse the returned JSON. Shape:

   ```jsonc
   {
     "url": "https://example.com",
     "score": 38,                 // 0–100, percentage of patterns triggered
     "tierLabel": "Mild",         // "Heavy" (5+), "Mild" (2–4), "Clean" (0–1)
     "patternsFlagged": 4,
     "patternsTotal": 16,
     "patterns": [
       { "id": "gradients", "label": "Gradients", "triggered": true,  "evidence": { ... } },
       { "id": "shadcn",    "label": "shadcn",    "triggered": false, "evidence": null }
       // ... 16 entries
     ]
   }
   ```

3. Summarise for the user, leading with the verdict:

   - **Tier + score** as the headline.
   - **Triggered patterns** in a short list (use the `label` field).
   - For 1–2 of the most prominent triggers, include one specific signal from the `evidence` object (e.g. for `gradients`: "5 gradient backgrounds + hero gradient text").
   - Don't repeat the full clean list; mention how many patterns were clean only if the user asks.

## When NOT to use

- The user provides text or a screenshot, not a URL — this skill needs a real reachable URL.
- The user wants to score multiple sites in bulk — point them at `git clone … && npm run analyze`.
- The user is asking about the methodology — the 16 patterns and rules live in `src/patterns/<id>.js` in the repo; link to https://github.com/AdrianKrebs/ai-design-checker.

## Pattern reference

The 16 patterns: templated fonts, VibeCode purple, gradients, shadcn signature, accent stripe, glassmorphism, colored glow, sidebar emoji, centered hero, all-caps headings, perma dark, icon-card grid, numbered 1·2·3 steps, stat banner, hero eyebrow pill, FAQ accordion. Full rules: https://github.com/AdrianKrebs/ai-design-checker/tree/main/src/patterns
