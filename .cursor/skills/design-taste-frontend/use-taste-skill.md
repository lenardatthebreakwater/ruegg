# Use Taste Skill for Peisbutikken UI

This project includes [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend` v2) — anti-slop frontend guidance for marketing surfaces and redesigns.

Installed from the customized copy in `ck-2.0` (same skill body; project constraints below are Peisbutikken-specific).

## When to use it

- Polishing marketing / storefront sections (hero, category hubs, campaign pages)
- Redesigning Min Konto or other account UI so it matches the brand (not generic dashboard chrome)
- Replacing AI-looking layouts with clearer hierarchy, type, and motion

Pair with **shadcn/ui** (`@/components/ui/`) for primitives. Taste Skill guides layout, typography, motion, and spacing — not reinventing buttons/dialogs.

## Example prompts

Polish Min Konto:

```
Follow the design-taste-frontend skill. Redesign the Min Konto account shell and nav.

Design read: Norwegian ecommerce account area for fireplace buyers, trust-first commerce, calm premium retail, leaning toward existing Peisbutikken storefront tokens and restrained motion.

Keep: Norwegian UI copy, /min-konto routes, auth + orders APIs, AccountNav composition.
Use: shadcn Button/Card patterns already in the project. No purple AI-slop.
```

Audit before changing:

```
Follow the design-taste-frontend skill redesign protocol. Audit components/account/ and list concrete fixes for hierarchy, spacing, and motion before changing code.
```

## Project constraints (always preserve)

- **Norwegian** for all end-user UI copy, URLs, and SEO (see `.cursor/rules/norwegian-user-content.mdc`)
- Prefer **shadcn** components from `@/components/ui/` (see `.cursor/rules/shadcn-prefer.mdc`)
- Structure UI as named components; pages compose only (see `.cursor/rules/components-everything.mdc`)
- Avoid `useEffect` for app logic (see `.cursor/rules/react-useeffect-effect-last.mdc`)
- This stack uses **Framer Motion / motion**, not GSAP — adapt taste-skill motion guidance accordingly
- Respect `prefers-reduced-motion`
- Preserve WordPress/WooCommerce BFF contracts; design work must not break auth/orders/pay SSO
- Existing storefront visual language wins over greenfield taste defaults when redesigning in-product pages

## Update the skill

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Or re-copy from `ck-2.0`:

```text
.agents/skills/design-taste-frontend/SKILL.md
→ .cursor/skills/design-taste-frontend/SKILL.md
```

Other variants from the [taste-skill repo](https://github.com/Leonxlnx/taste-skill): `design-taste-frontend-v1`, `gpt-taste`, `redesign-existing-projects`, `high-end-visual-design`, `minimalist-ui`.
