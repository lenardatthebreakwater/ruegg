# Feature: Cookie Consent Settings Modal (Template Match, Native Design)

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Update the cookie consent UX so the current secondary action in the banner is no longer a direct reject action.  
Replace `Avslå` with `Innstillinger`, and open a dedicated settings popup when clicked.  
The popup must mirror the **information architecture/template and element positions** shown in the provided image (top tabs, explanatory content block, consent-category toggles, bottom action row), while keeping the visual design aligned with this project's existing shadcn button/card/dialog language.

## User Story

As a visitor on the storefront  
I want to open cookie settings from the consent banner  
So that I can review and choose consent categories before confirming.

## Problem Statement

The current banner offers only two immediate outcomes (`Tillat` / `Avslå`) and does not provide a granular consent settings surface. This limits user control and does not match the desired UX template where users can open settings and decide per category.

## Solution Statement

Add a cookie settings dialog launched from the banner's `Innstillinger` button.  
Use shadcn `Dialog` + `Card` + `Button`, and add shadcn `Tabs` and `Switch` components for template parity with the reference layout.  
Introduce a structured consent model (with backwards compatibility for existing cookie values) so settings actions (`Avslå`, `Tillat utvalg`, `Tillat alle`) persist predictable, extensible consent state.

## Feature Metadata

**Feature Type**: Enhancement  
**Estimated Complexity**: Medium  
**Primary Systems Affected**: Cookie consent UI component, consent cookie model/serialization, root layout interaction flow  
**Dependencies**: shadcn/ui (`dialog`, `card`, `button`, `tabs`, `switch`), existing cookie utilities in `lib/cookie-consent.ts`

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `components/cookie-consent/cookie-consent-banner.tsx` (lines 1-94) - Current cookie banner logic/UI; replace `Avslå` CTA with `Innstillinger` and wire dialog state.
- `lib/cookie-consent.ts` (lines 1-14) - Current cookie-name constant and consent serialization (`allowed`/`declined`).
- `app/layout.tsx` (lines 70-77) - Injection point for global banner in app shell.
- `components/search/search-popup.tsx` (lines 211-423) - Existing modal/dialog composition pattern with accessibility title and controlled open state.
- `components/ui/dialog.tsx` (lines 52-88) - Project dialog wrapper API (`showCloseButton`, overlay/content conventions).
- `components/ui/card.tsx` (lines 5-93) - Card composition and spacing conventions.
- `components/ui/button.tsx` (lines 7-71) - Button variants/sizes that should be reused for bottom action row.
- `.cursor/rules/norwegian-user-content.mdc` - User-visible copy must be Norwegian.
- `.cursor/rules/components-everything.mdc` - Keep page-level markup decomposed into named components.
- `.cursor/rules/shadcn-prefer.mdc` - Prefer shadcn components over custom primitives.
- `.cursor/rules/react-useeffect-effect-last.mdc` - Avoid direct `useEffect`; use existing effect-last abstractions when lifecycle sync is needed.

### New Files to Create

- `components/cookie-consent/cookie-consent-settings-dialog.tsx` - New dialog component matching required template layout (tabs/content/toggles/actions).

### Existing Files to Update

- `components/cookie-consent/cookie-consent-banner.tsx` - Replace decline action with settings trigger and integrate dialog.
- `lib/cookie-consent.ts` - Extend consent model and add parse/normalize helpers for category-level choices.

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [shadcn Dialog (radix)](https://ui.shadcn.com/docs/components/radix/dialog)
  - Specific section: controlled open state, content composition, accessibility title.
  - Why: dialog behavior and semantics for settings popup.
- [shadcn Tabs (radix)](https://ui.shadcn.com/docs/components/radix/tabs)
  - Specific section: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` structure.
  - Why: top `Consent / Details / About` template row.
- [shadcn Switch (radix)](https://ui.shadcn.com/docs/components/radix/switch)
  - Specific section: controlled checked state and disabled handling.
  - Why: per-category consent toggles (`Nødvendig`, `Preferanser`, `Statistikk`, `Markedsføring`).
- [Radix Dialog API](https://www.radix-ui.com/docs/primitives/components/dialog.md)
  - Specific section: focus trap + keyboard dismissal semantics.
  - Why: prevents accessibility regressions in modal interaction.
- [MDN Set-Cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
  - Specific section: `Max-Age`, `SameSite`, `Secure`.
  - Why: preserve robust cookie serialization while changing payload format.

### Patterns to Follow

**Naming Conventions:**
- Keep code identifiers in English (`CookieConsentSettingsDialog`, `ConsentCategoryState`).
- Keep all user-facing copy in Norwegian (`Innstillinger`, `Tillat utvalg`, `Nødvendig`).

**State & Effect Pattern:**
- Keep consent cookie existence check and open/close logic in banner component.
- For mount-only checks, continue using `useMountEffect` instead of raw `useEffect`.

**UI Composition Pattern:**
- Use shadcn primitives only: `Dialog`, `Card`, `Button`, `Tabs`, `Switch`, optional `Separator`.
- Use full card composition for dialog sections (header/content/footer) where practical.

**Template Mapping Pattern (from attached image):**
- Top navigation row: 3 tab labels (`Samtykke`, `Detaljer`, `Om`).
- Middle explanatory text block.
- Category row: 4 equal columns (necessary + 3 optional categories) with one toggle each.
- Bottom action row: 3 buttons (`Avslå`, `Tillat utvalg`, `Tillat alle`).
- Keep this structure and positioning; do not replicate external styling literally.

**Backward Compatibility Pattern:**
- Existing cookie values (`allowed` / `declined`) must still parse safely.
- Normalize old values to new internal shape so no visitor flow breaks after deploy.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

Introduce a consent-domain model that supports both old and new cookie payloads.

**Tasks:**

- Expand cookie consent types from binary string enum to a structured model with categories.
- Add parse/normalize helpers to handle old string payloads and new JSON payload.
- Keep cookie name and security attributes unchanged.

### Phase 2: Core Implementation

Build settings dialog UI with shadcn components and template-equivalent layout.

**Tasks:**

- Add `Tabs` and `Switch` shadcn components to project.
- Create dialog component with top tabs, explanatory copy, category toggle grid, and action row.
- Ensure `Nødvendig` category is always enabled/locked.

### Phase 3: Integration

Wire banner action flow to open settings and persist selected consent.

**Tasks:**

- Replace `Avslå` secondary banner button with `Innstillinger`.
- Add controlled dialog open state from banner component.
- Implement action handlers for `Avslå`, `Tillat utvalg`, and `Tillat alle`.

### Phase 4: Testing & Validation

Validate behavior, accessibility, and responsive layout parity with requested template structure.

**Tasks:**

- Run lint/build.
- Manually test banner-to-dialog flow and cookie persistence.
- Validate keyboard and screen-reader modal basics.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### ADD shadcn components (`Tabs`, `Switch`)

- **IMPLEMENT**: Add missing UI primitives with shadcn CLI.
- **PATTERN**: Follow existing `components/ui` import alias conventions from `components.json`.
- **IMPORTS**: `@/components/ui/tabs`, `@/components/ui/switch`.
- **GOTCHA**: Do not introduce custom toggle primitives when shadcn `Switch` exists.
- **VALIDATE**: `npx shadcn@latest add tabs switch`

### UPDATE `lib/cookie-consent.ts`

- **IMPLEMENT**: Introduce structured consent type for categories (`necessary`, `preferences`, `statistics`, `marketing`) and helper builders for common presets.
- **IMPLEMENT**: Add parser/normalizer that accepts legacy (`allowed`/`declined`) and returns normalized structured object.
- **IMPLEMENT**: Update `consentCookieString` to serialize structured payload (e.g. JSON + URI encoding) while preserving security attributes.
- **PATTERN**: Mirror existing constant/helper style in same file.
- **GOTCHA**: Never allow `necessary` to be persisted as false.
- **VALIDATE**: `npm run lint -- lib/cookie-consent.ts`

### CREATE `components/cookie-consent/cookie-consent-settings-dialog.tsx`

- **IMPLEMENT**: Build controlled dialog component receiving `open`, `onOpenChange`, current consent state, and action callbacks.
- **IMPLEMENT**: Reproduce template structure/positions from image:
  - top tabs (`Samtykke`, `Detaljer`, `Om`)
  - explanatory paragraph block
  - four category toggle cards/columns
  - bottom action button row (`Avslå`, `Tillat utvalg`, `Tillat alle`)
- **PATTERN**: Follow dialog accessibility composition used in `components/search/search-popup.tsx` and `components/ui/dialog.tsx`.
- **IMPORTS**: `Dialog*`, `Card*`, `Button`, `Tabs*`, `Switch`.
- **GOTCHA**: Use Norwegian copy for all visible strings; keep design-system variants (no copied third-party styles).
- **VALIDATE**: `npm run lint -- components/cookie-consent/cookie-consent-settings-dialog.tsx`

### UPDATE `components/cookie-consent/cookie-consent-banner.tsx`

- **IMPLEMENT**: Replace `Avslå` button with `Innstillinger`.
- **IMPLEMENT**: Keep `Tillat` quick action for one-click acceptance from banner.
- **IMPLEMENT**: Add local state for settings dialog visibility and selected category toggles.
- **IMPLEMENT**: Wire settings action handlers:
  - `Avslå` -> persist all optional categories false
  - `Tillat utvalg` -> persist current toggle selection
  - `Tillat alle` -> persist all categories true
- **PATTERN**: Maintain mount-open behavior via `useMountEffect`.
- **GOTCHA**: Do not close banner until a persistence action is chosen in settings.
- **VALIDATE**: `npm run lint -- components/cookie-consent/cookie-consent-banner.tsx`

### VALIDATE full feature integration

- **IMPLEMENT**: Confirm no regressions after consent model changes and new dialog flow.
- **VALIDATE**: `npm run lint`
- **VALIDATE**: `npm run build`

---

## TESTING STRATEGY

The repo currently has no test files (`*.test.*` / `*.spec.*`), so validation relies on lint/build and focused manual verification.

### Unit Tests

- `N/A (no unit test runner configured in scripts)`

### Integration Tests

- `N/A (no integration test runner configured in scripts)`

### Edge Cases

- Existing visitor has legacy cookie value `allowed` -> banner stays hidden and normalizes to full-allow shape when reopened later.
- Existing visitor has legacy `declined` -> banner stays hidden and normalizes to optional-disabled shape.
- User opens settings, changes toggles, closes dialog without action -> banner remains visible (no accidental consent).
- `Nødvendig` toggle remains enabled and non-editable.
- Keyboard navigation: tab focus cycles through dialog controls; `Esc` closes dialog safely.
- Mobile viewport: category cards stack/wrap without clipping action row.

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and feature correctness.

### Level 1: Syntax & Style

- `npx shadcn@latest add tabs switch`
- `npm run lint -- lib/cookie-consent.ts`
- `npm run lint -- components/cookie-consent/cookie-consent-settings-dialog.tsx`
- `npm run lint -- components/cookie-consent/cookie-consent-banner.tsx`
- `npm run lint`

### Level 2: Unit Tests

- `N/A (no test runner configured in scripts)`

### Level 3: Integration Tests

- `N/A (no integration test runner configured in scripts)`

### Level 4: Manual Validation

- Start app: `npm run dev`
- Open any page without consent cookie and verify banner appears.
- Verify secondary CTA label is `Innstillinger` (not `Avslå`).
- Click `Innstillinger` and verify popup opens with required structure:
  - tabs row at top
  - explanatory text section
  - four category toggle blocks
  - three action buttons at bottom
- Toggle optional categories and click `Tillat utvalg`; refresh page; verify banner remains hidden (cookie saved).
- Click `Avslå` in settings and verify optional categories save as false.
- Click `Tillat alle` and verify all optional categories save as true.
- Re-open flow on mobile width and ensure layout keeps template positions logically.

### Level 5: Additional Validation (Optional)

- Inspect `document.cookie` in browser devtools and verify consent cookie is present and parseable.

---

## ACCEPTANCE CRITERIA

- [ ] Banner secondary action text is Norwegian `Innstillinger`.
- [ ] Clicking `Innstillinger` opens a settings popup.
- [ ] Popup mirrors attached template structure/positions (tabs, content block, category toggles, 3-button action row).
- [ ] Popup uses project design system (shadcn components and existing variants), not copied third-party styling.
- [ ] Category controls include `Nødvendig`, `Preferanser`, `Statistikk`, `Markedsføring`.
- [ ] `Nødvendig` is always enabled and cannot be disabled.
- [ ] `Avslå`, `Tillat utvalg`, and `Tillat alle` actions persist expected consent state.
- [ ] Legacy consent cookie values remain compatible.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full available validation suite passes (`lint` + `build`)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms banner + settings behavior
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

- Translate copied reference content intent into Norwegian storefront copy to comply with workspace language rule.
- Keep template parity focused on information architecture and element placement, not colors/spacing tokens from the screenshot.
- Prefer extracting any complex sub-block (category card row or actions row) into internal subcomponents if `cookie-consent-banner.tsx` becomes too large.
- Confidence Score for one-pass implementation success: **9/10**.
