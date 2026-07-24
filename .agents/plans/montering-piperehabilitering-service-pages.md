# Feature: Montering + Piperehabilitering Service Pages (Homepage Vibe)

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Build two high-conversion service landing pages for `montering` and `piperehabilitering` that reuse homepage visual language and component patterns.  
Each page should include: hero with CTA + image box, trust section, map section, gallery, FAQ, and contact form.  
Content must be sourced from existing live pages and rewritten into clear, confidence-building Norwegian copy that reduces buyer hesitation and increases inquiry submissions.

## User Story

As a homeowner considering peis montering or piperehabilitering  
I want a clear, trustworthy service page with proof, process, and easy contact  
So that I feel safe choosing Peisbutikken and sending a request.

## Problem Statement

Current route pages for `montering` and `piperehabilitering` are shell-only placeholders and do not communicate service value, trust, process clarity, or a persuasive CTA flow. This creates conversion risk and weak brand consistency with the homepage experience.

## Solution Statement

Create a reusable service-page composition that mirrors homepage rhythm, typography, and section design while allowing page-specific content.  
Use a shared data model per service (`montering`, `piperehabilitering`) and render sections in a conversion-focused order: problem/benefit framing -> trust/proof -> local relevance -> visual evidence -> objection handling (FAQ) -> low-friction contact.

## Feature Metadata

**Feature Type**: Enhancement  
**Estimated Complexity**: Medium  
**Primary Systems Affected**: App routes, homepage section components reuse, new service content/data layer, SEO metadata/schema  
**Dependencies**: Next.js App Router metadata APIs, existing shadcn/ui blocks, existing homepage components, JSON-LD helpers

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `app/montering/page.tsx` (lines 1-15) - Current placeholder route to replace with composed service page.
- `app/piperehabilitering/page.tsx` (lines 1-15) - Current placeholder route to replace with composed service page.
- `components/site/simple-static-page-shell.tsx` (lines 1-21) - Existing shell wrapper pattern for navbar/footer.
- `app/page.tsx` (lines 68-92) - Homepage section order and "vibe" baseline.
- `components/homepage/hero-section.tsx` (lines 29-102) - Hero visual tone, CTA style, and motion pattern.
- `components/homepage/trust-section.tsx` (lines 10-67) - Trust bar design and card treatment.
- `components/homepage/location-section.tsx` (lines 27-157) - Map section pattern; already supports configurable heading/description/location props.
- `components/homepage/faq-section.tsx` (lines 26-119) - FAQ layout pattern (two-column accordion).
- `components/homepage/contact-section.tsx` (lines 8-21) - Reusable contact section wrapper used on homepage.
- `components/shadcn-studio/blocks/contact-us-page-15/contact-us-page-15.tsx` (lines 25-152) - Actual contact form block layout and behavior.
- `components/shadcn-studio/blocks/contact-us-page-15/contact-form.tsx` (lines 14-103) - Form field labels/copy style and submit handling.
- `components/product-detail/product-inspiration-gallery.tsx` (lines 18-87) - Existing gallery pattern that can be reused/adapted for service image examples.
- `components/homepage/warm-glow-background.tsx` (lines 1-10) - Ambient homepage background effect to preserve visual continuity.
- `lib/data/homepage.ts` (lines 226-333) - Data modeling patterns for FAQ and location content.
- `lib/seo/metadata.ts` (lines 20-46) - Canonical/open graph metadata builder pattern.
- `lib/seo/schema.ts` (lines 147-160) - Existing `buildFaqSchema` JSON-LD helper.
- `components/seo/json-ld-script.tsx` (lines 1-14) - JSON-LD script injection pattern.
- `lib/page-rhythm.ts` (lines 1-15) - Standardized spacing/rhythm tokens used across homepage sections.
- `components/section-intro.tsx` (lines 42-82) - Shared heading/description typography and alignment conventions.

### New Files to Create

- `lib/data/service-pages.ts` - Typed content model and data objects for both service pages.
- `components/service-pages/service-hero-section.tsx` - Reusable hero section with CTA + image box (homepage-consistent style).
- `components/service-pages/service-gallery-section.tsx` - Service gallery section (reuse/adapt product inspiration gallery layout).
- `components/service-pages/service-landing-page.tsx` - Top-level composer that arranges hero, trust, map, gallery, FAQ, and contact.
- `components/service-pages/index.ts` - Barrel exports for service page components.

### Existing Files to Update

- `app/montering/page.tsx` - Replace placeholder with service data + composed page sections + SEO schema.
- `app/piperehabilitering/page.tsx` - Replace placeholder with service data + composed page sections + SEO schema.
- `components/homepage/trust-section.tsx` - Make trust items configurable via props (keep current defaults for homepage).
- `components/homepage/contact-section.tsx` (optional) - Add optional section intro override only if needed; otherwise reuse as-is.

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Piperehabilitering source content](https://peisbutikken.no/piperehabilitering/)
  - Specific section: Hero, signs/benefits, process, price, FAQ.
  - Why: Primary content source for recreated page.
- [Montering source content](https://peisbutikken.no/montering/)
  - Specific section: Hero, safety, locations, prices, FAQ.
  - Why: Primary content source for recreated page.
- [Next.js `generateMetadata` docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
  - Specific section: Dynamic metadata in App Router routes.
  - Why: Ensure metadata implementation remains idiomatic and future-proof.
- [Google Search Central FAQ structured data](https://developers.google.cn/search/docs/data-types/faqpage)
  - Specific section: Visibility parity and required FAQ fields.
  - Why: Prevent invalid FAQ schema implementation.
- [NN/g trustworthiness factors](https://www.nngroup.com/articles/trust-or-bust-communicating-trustworthiness-in-web-design)
  - Specific section: Design quality, disclosure, and trust communication.
  - Why: Ground conversion copy/layout decisions in evidence-based trust principles.

### Patterns to Follow

**Naming Conventions:**
- Route folder names in Norwegian slugs: `app/montering`, `app/piperehabilitering`.
- Component names in English PascalCase (e.g., `ServiceLandingPage`, `ServiceHeroSection`).
- Data model and keys in English types, Norwegian user-facing strings.

**Page Composition Pattern:**
- Follow homepage shell pattern with ambient background + navbar/footer wrapper:
  - `app/page.tsx` composes top-level sections in a clean vertical stack.
- Keep route page files thin (compose components only), consistent with project rule "Everything Is a Component".

**Section Styling Pattern:**
- Use `ContainedLayout`, `SectionIntro`, and `PAGE_SECTION_PY` rhythm constants.
- Reuse shadcn components (`Button`, `Card`, `Accordion`) instead of raw custom primitives.

**SEO/Schema Pattern:**
- Use `buildPageMetadata` for route metadata.
- Inject FAQ schema via `JsonLdScript` + `buildFaqSchema` when FAQ is present.

**Map Extensibility Pattern (future map changes):**
- Keep map config in data (`mapsEmbedUrl`, `mapsPlaceUrl`, labels, intro copy), not in section JSX.
- Reuse `LocationSection` prop surface so map source/provider can be swapped later with minimal route/component changes.

**Consumer-Psychology Copy Pattern (for content authoring):**
- Lead with outcome and risk reduction (safety/compliance, fewer unknowns, predictable process).
- Place trust evidence early (rating, certified installers, local footprint).
- Use objection-killing FAQ (price, process, permits, time, living in house during work).
- Keep CTA copy specific and low-friction (`Få uforpliktende tilbud`, `Bestill befaring`).

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

Create a shared content model and page composer to avoid duplication and keep both service pages visually consistent.

**Tasks:**

- Create typed service page data model in `lib/data/service-pages.ts`.
- Capture all copy/content from source pages, rewritten in concise Norwegian conversion-oriented format.
- Create reusable service landing composer component with required section slots and ordering support.
- Ensure map, FAQ, and gallery are data-driven (no hard-coded montering/piperehab values inside components).

### Phase 2: Core Implementation

Implement page-specific UI sections and section ordering to match homepage vibe while respecting service context.

**Tasks:**

- Build `ServiceHeroSection` with homepage-style treatment, CTA button(s), and image box.
- Reuse/extend trust section to support service-specific trust points.
- Reuse `LocationSection` for map block and pass service-specific intro copy.
- Build/compose service gallery section (using existing gallery tile pattern).
- Reuse homepage `FAQSection` with service-specific FAQ items.
- Reuse homepage `ContactSection` to keep form UX consistent with homepage.

### Phase 3: Integration

Wire route pages to data + component composition and add metadata/schema.

**Tasks:**

- Update `app/montering/page.tsx` to render composed service page with montering content.
- Update `app/piperehabilitering/page.tsx` to render composed service page with piperehabilitering content.
- Add JSON-LD FAQ schema to each page with matching visible FAQ content.
- Verify canonical URLs and metadata descriptions are conversion-relevant and accurate.

### Phase 4: Testing & Validation

Validate layout consistency, content clarity, and technical correctness.

**Tasks:**

- Run lint/build for updated paths.
- Manually verify responsive layout and animation performance.
- Confirm FAQ schema payload matches visible Q&A.
- Confirm both pages maintain homepage visual language and section rhythm.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE `lib/data/service-pages.ts`

- **IMPLEMENT**: Define `ServicePageData` type with nested structures for hero, trust items, location, gallery, FAQ, and CTA labels/URLs.
- **IMPLEMENT**: Add `monteringPageData` and `piperehabiliteringPageData`.
- **IMPLEMENT**: Rewrite source text into conversion-focused Norwegian copy (benefit-led headlines, risk reduction, clear CTA).
- **PATTERN**: Mirror data typing style from `lib/data/homepage.ts`.
- **GOTCHA**: Keep user-visible text in Norwegian; keep code identifiers in English.
- **VALIDATE**: `npm run lint -- lib/data/service-pages.ts`

### CREATE `components/service-pages/service-hero-section.tsx`

- **IMPLEMENT**: Add a service hero with left content (headline, supportive body, CTA) and right image box.
- **IMPLEMENT**: Reuse homepage visual language (overlay/gradient, spacing, button variants).
- **PATTERN**: Mirror motion and CTA treatment from `components/homepage/hero-section.tsx`.
- **IMPORTS**: `Button`, `ContainedLayout`, `SectionIntro`, `motion`, `next/image`, `next/link`.
- **GOTCHA**: Keep mobile readability high with overlay and avoid text over busy imagery.
- **VALIDATE**: `npm run lint -- components/service-pages/service-hero-section.tsx`

### UPDATE `components/homepage/trust-section.tsx`

- **IMPLEMENT**: Add optional prop for trust items while preserving current defaults for homepage usage.
- **PATTERN**: Keep existing card/beam design unchanged; only parameterize content.
- **GOTCHA**: Do not break existing import signature for homepage call sites.
- **VALIDATE**: `npm run lint -- components/homepage/trust-section.tsx`

### CREATE `components/service-pages/service-gallery-section.tsx`

- **IMPLEMENT**: Build gallery section using existing tile layout feel (2-column desktop, stacked mobile).
- **PATTERN**: Reuse structure from `components/product-detail/product-inspiration-gallery.tsx` and wrap in homepage rhythm styles.
- **IMPLEMENT**: Include section intro and optional captions.
- **GOTCHA**: Prefer `next/image` for optimization unless external constraints require plain `img`.
- **VALIDATE**: `npm run lint -- components/service-pages/service-gallery-section.tsx`

### CREATE `components/service-pages/service-landing-page.tsx`

- **IMPLEMENT**: Compose sections in final order (recommended):
  1) Hero  
  2) Trust  
  3) Map  
  4) Gallery  
  5) FAQ  
  6) Contact
- **PATTERN**: Keep page files thin by moving orchestration here.
- **IMPLEMENT**: Reuse `LocationSection`, `FAQSection`, `ContactSection`, and `WarmGlowBackground` for homepage vibe continuity.
- **GOTCHA**: Keep map/FAQ inputs fully data-driven for future content changes.
- **VALIDATE**: `npm run lint -- components/service-pages/service-landing-page.tsx`

### CREATE `components/service-pages/index.ts`

- **IMPLEMENT**: Export service page components from a barrel file.
- **PATTERN**: Mirror `components/homepage/index.ts` export style.
- **VALIDATE**: `npm run lint -- components/service-pages/index.ts`

### UPDATE `app/montering/page.tsx`

- **IMPLEMENT**: Replace `SimpleStaticPageShell` usage with `ServiceLandingPage` + `monteringPageData`.
- **IMPLEMENT**: Keep metadata via `buildPageMetadata`, improve title/description for intent + conversion.
- **IMPLEMENT**: Add `JsonLdScript` + `buildFaqSchema(montering FAQ)`.
- **PATTERN**: Follow homepage route composition and SEO script insertion style from `app/page.tsx`.
- **GOTCHA**: Ensure FAQ schema questions exactly match visible FAQ text.
- **VALIDATE**: `npm run lint -- app/montering/page.tsx`

### UPDATE `app/piperehabilitering/page.tsx`

- **IMPLEMENT**: Replace `SimpleStaticPageShell` usage with `ServiceLandingPage` + `piperehabiliteringPageData`.
- **IMPLEMENT**: Keep metadata via `buildPageMetadata`, improve title/description for intent + conversion.
- **IMPLEMENT**: Add `JsonLdScript` + `buildFaqSchema(piperehabilitering FAQ)`.
- **PATTERN**: Follow same route pattern as `app/montering/page.tsx` for maintainability.
- **GOTCHA**: Keep canonical path as `/piperehabilitering/`.
- **VALIDATE**: `npm run lint -- app/piperehabilitering/page.tsx`

### VALIDATE full feature integration

- **IMPLEMENT**: Run project lint and build to catch type/runtime issues.
- **VALIDATE**: `npm run lint`
- **VALIDATE**: `npm run build`

---

## TESTING STRATEGY

The project currently has no automated test suite files (`*.test.*` / `*.spec.*` not present), so testing is lint/build + structured manual checks.

### Unit Tests

- Not currently established in repo.  
- If test tooling is introduced later, start with pure-data tests for `lib/data/service-pages.ts` shape integrity and required fields.

### Integration Tests

- Not currently established in repo.  
- Manual integration verification across both routes is required.

### Edge Cases

- Missing optional gallery images should not break layout.
- FAQ list shorter than 12 items should still render correctly in FAQ columns.
- Map embed URL missing should fall back to generated search-based URL behavior from `LocationSection`.
- Very long FAQ answers should wrap without layout overflow.
- Hero CTA should remain visible and tappable on small screens.
- Contact form submission still opens mail client with populated fields.

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and feature correctness.

### Level 1: Syntax & Style

- `npm run lint -- lib/data/service-pages.ts`
- `npm run lint -- components/service-pages/service-hero-section.tsx`
- `npm run lint -- components/service-pages/service-gallery-section.tsx`
- `npm run lint -- components/service-pages/service-landing-page.tsx`
- `npm run lint -- components/homepage/trust-section.tsx`
- `npm run lint -- app/montering/page.tsx`
- `npm run lint -- app/piperehabilitering/page.tsx`
- `npm run lint`

### Level 2: Unit Tests

- `N/A (no test runner configured in scripts)`

### Level 3: Integration Tests

- `N/A (no integration test runner configured in scripts)`

### Level 4: Manual Validation

- Start app: `npm run dev`
- Visit `/montering/` and verify all required sections exist and match intended order.
- Visit `/piperehabilitering/` and verify same design system with page-specific content.
- Compare visual language with homepage (`/`) for rhythm, spacing, CTA styling, and trust presentation.
- Confirm map block renders and "Åpne i Google Maps" links open expected target.
- Expand/collapse FAQ entries on desktop and mobile.
- Submit contact form and confirm generated email includes filled fields.
- Verify no obvious layout shifts at mobile/tablet/desktop breakpoints.

### Level 5: Additional Validation (Optional)

- Validate FAQ schema in rich results testing workflow after deployment preview.

---

## ACCEPTANCE CRITERIA

- [ ] Both pages implement all required sections: hero with CTA + image box, trust, map, gallery, FAQ, contact.
- [ ] Both pages visually align with homepage vibe (spacing, typography, card treatment, CTA hierarchy).
- [ ] Content is Norwegian, service-specific, and conversion-oriented without sounding manipulative.
- [ ] Map section is data-driven and easy to replace/upgrade later.
- [ ] FAQ section uses homepage accordion design with service-specific Q&A.
- [ ] Contact section matches homepage contact block.
- [ ] Route metadata (title/description/canonical) is accurate for each page.
- [ ] FAQ structured data is present and mirrors visible FAQ content.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full available validation suite passes (`lint` + `build`)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms both pages behave correctly
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

- The two pages should share one reusable component architecture with data-driven content, not copy-pasted JSX per route.
- Keep “homepage vibe” by reusing existing primitives (`ContainedLayout`, `SectionIntro`, rhythm constants, section-level card aesthetics).
- Trust and conversion principles should be implemented through content structure:
  - Above the fold: clear outcome + immediate CTA
  - Early trust: proof/credentials
  - Mid-page reassurance: process clarity, locality (map), real work examples (gallery)
  - Bottom-page friction reduction: FAQ + easy contact
- Avoid introducing `useEffect` for derived UI logic; follow existing rule to keep rendering declarative.
- Confidence Score for one-pass implementation success: **8.5/10**.
