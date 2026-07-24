# Rüegg Style Guide (ruegg.no redesign)

**Status:** Design deliverable only (no homepage implementation in this pass)  
**Date:** 2026-07-24  
**Method:** Chrome DevTools MCP crawl of reference sites + ruegg.swiss brand lock + design-taste dials  
**Strategy:** Catalog + lead-gen (Strategy A). No cart.

---

## Design Read

Reading this as: **premium fireplace brand redesign (catalog + lead-gen) for Norwegian homeowners and architects**, with a **calm, material, Swiss-heritage language**, leaning toward **Oblica/Brunner professional spacing + GoDaylight motivated scroll motion + Everyday multi-clip atmospheric hero**, while locking **ruegg.swiss colors and logo**.

Boss method: **take one element from each cool site and combine into something unique**. This guide maps that mix.

---

## Dials

| Dial | Value | Why |
| --- | --- | --- |
| `DESIGN_VARIANCE` | **7** | Premium brand, not chaotic agency. Allow asymmetric splits and sticky storytelling, but keep grid discipline (Oblica/Brunner). Above 4 so hero is not a boring centered template by default. |
| `MOTION_INTENSITY` | **7** | Boss wants creative motion that beats ruegg.swiss. GoDaylight-level scroll section transitions + motivated reveals. Not 9–10 cinematic hijack everywhere. |
| `VISUAL_DENSITY` | **3** | Fireplace / architecture feel = airy gallery spacing (Oblica section padding ~90–120px). Dense cockpit UI would fight the brand. |

**Theme lock:** Light-first (ruegg.swiss cream / ink). Dark mode tokens may exist later for system preference, but marketing sections should stay in one family (no mid-page theme flip).

---

## 1. Brand tokens (from ruegg.swiss)

Live sample: https://ruegg.swiss/de-ch/ (Chrome DevTools, 2026-07-24).

### Colors (hex)

| Token | Hex | RGB | Role |
| --- | --- | --- | --- |
| `--ruegg-ink` | `#393623` | `rgb(57, 54, 35)` | Primary text / logo fill on light |
| `--ruegg-olive` | `#4f4c38` | `rgb(79, 76, 56)` | Secondary surfaces, soft panels |
| `--ruegg-muted` | `#707272` | `rgb(112, 114, 114)` | Secondary nav / captions |
| `--ruegg-cream` | `#e6e4c7` | `rgb(230, 228, 199)` | Brand cream surface / bands |
| `--ruegg-paper` | `#f7f7ef` | `rgb(247, 247, 239)` | Page / near-white background |
| `--ruegg-taupe` | `#bbb99e` | `rgb(187, 185, 158)` | Soft borders / muted fills |
| `--ruegg-deep` | `#262418` | `rgb(38, 36, 24)` | Deep panels (rare; footer-adjacent) |

**Accent lock (mandatory):** One accent for the whole Norwegian site.

- **Canonical accent for this redesign:** stay inside the Swiss olive/cream family. Prefer **ink CTAs on cream**, or a single **deep olive** button (`#4f4c38` / `#393623`), not a new hue.
- **Do not invent** AI purple, solar orange, Funner rainbow pills, or Oblica’s `#ff4d16` for Rüegg.
- **Legacy note:** Current repo `--primary: #bb0013` (Norwegian red) did **not** appear as a dominant live color on ruegg.swiss. Treat red as **optional only if brand confirms** it for .no CTAs. Default recommendation: **retire red as primary**, keep Swiss neutrals, use one restrained CTA treatment (filled ink or cream-on-ink).

### Logo rules

- Source of truth: **official Rüegg logo from ruegg.swiss** (SVG wordmark preferred).
- Repo today: text wordmark only (`components/brand/ruegg-wordmark.tsx`) until assets land in `public/`.
- Rules:
  - Prefer SVG (light + dark variants if needed).
  - Clear space ≥ height of the “R” on all sides.
  - Do not stretch, outline, recolor arbitrarily, or place on busy fire video without a scrim.
  - Nav height target: **64–72px** (max 80px). Logo must fit that bar.

### Type baseline (Swiss)

- Live swiss font: proprietary **`Ruegg Sans`** (weights seen: 200, 300, 500, 600).
- H1 on swiss: ~44px, **weight 200**, ink color, generous line-height.
- Body: same family, regular weight, muted gray for secondary links.

---

## 2. Typography (professional, not whimsical)

### Direction

Match **Oblica** (`dinot` / DIN-like geometric sans) and **Brunner** (professional studio sans): clean, architectural, no playful display, no default Inter.

### What the repo already has

- **Plus Jakarta Sans** self-hosted in `app/globals.css` / `public/fonts/` (weights 400, 500, 600).
- `--font-display` currently falls toward **serif** via `.font-display` utility. For this redesign, **do not ship serif display** unless Swiss brand assets require it.

### Recommendation

| Role | Choice | Notes |
| --- | --- | --- |
| UI / body | **Plus Jakarta Sans** (keep) | Already licensed/self-hosted; professional; not Inter. |
| Display / headlines | **Same family**, weight **500–600** (or light **300** for large hero airiness like Swiss 200) | Sans display only. No Fraunces / Instrument Serif. |
| Ideal later | License **Ruegg Sans** for .no if Swiss allows | Best brand match; until then Plus Jakarta is the practical lock. |

### Scale (starting point)

- Hero H1: `text-4xl md:text-5xl lg:text-6xl`, tracking tight, max **2 lines**.
- Section H2: `text-2xl sm:text-3xl`.
- Body: `text-base`, `leading-relaxed`, max-width ~`65ch`.
- Captions / trust: muted `#707272`, not tiny illegible micro-type.

### Emphasis

Italic or bold of the **same** sans. Do not mix a random serif word into a sans headline.

---

## 3. Spacing / layout system (Oblica + Brunner)

### From Oblica (live)

- Thin mega-nav feel, but **content containers** ~**1200px** (some blocks ~900px).
- Section vertical padding often **~90–120px** (`pad: 90px 0`, `120px 0`).
- Full-bleed hero image + short punchy headline (“Luxurious Warmth”).
- Category doors as large image cards with short copy + “view all”.
- Strong lead CTA: **BOOK AN IN-STORE APPOINTMENT** (map to Norwegian showroom / tilbud).

### From Brunner (unreachable this pass)

`brunnerstudio.com` → `ERR_NAME_NOT_RESOLVED`  
`brunnerstudio.no` / `www.brunnerstudio.no` → `ERR_CONNECTION_TIMED_OUT`  

Use **prior crawl / structure notes**:

- Premium Asker “studio” tone: catalog + **book a viewing**.
- Short punchy hero line.
- Clear **category doors** under hero.
- Optional series/family step before products.
- Speak to homeowner **and** architect.
- Material language (stone, timber, concrete) + lifestyle fire imagery.
- Thin nav; no cart-first UX to copy.

### Rüegg layout tokens (propose)

| Token | Value |
| --- | --- |
| Page max width | `max-w-[1200px]` content; full-bleed for hero/media |
| Section Y | `py-20 md:py-28 lg:py-32` (density dial 3) |
| Gutter | `px-4 md:px-6 lg:px-8` |
| Grid | CSS Grid; avoid flex % math |
| Radius lock | One system: soft **10–12px** for media/cards; buttons either soft-rect or slight radius (document one rule and stick to it) |
| Cards | Prefer spacing + hairlines over boxed cards; cards only when interaction needs a container (product tiles, FAQ) |

### Hero stack (max 4 text elements)

1. Optional brand / logo  
2. Headline (≤ 2 lines)  
3. Subtext (≤ 20 words)  
4. CTA group (1 primary + max 1 secondary)

No trust strip, no stats, no scroll cue inside the hero.

---

## 4. Motion language (GoDaylight)

**What user liked:** scroll section transitions; text/element animations that feel **motivated**, not random.

### Live observations (godaylight.com)

- Sticky full-viewport panels (`sticky top-0 h-svh`).
- Layered storytelling: hero → sticky “how it works” steps that pin while content advances.
- Scale / clip-path / opacity used for **section change**, not decoration.
- Motion communicates **narrative sequence** (Subscribe → Install → Power on).

### Rüegg motion rules

**Animate when it answers one of:**

1. Hierarchy (draw eye to the right thing)  
2. Storytelling (reveal in a sequence that matches the journey)  
3. Feedback (hover / form / CTA press)  
4. State transition (image swap, accordion open)

**Primary patterns to steal:**

| Pattern | Use on ruegg.no |
| --- | --- |
| Sticky-stack / pinned section | **How it works** (3 steps: velg → råd/tilbud → montering) |
| Scroll-reveal stagger | Benefits, categories, FAQ intro |
| Soft hero fade-up | Headline + CTA once on load |
| Hover physics (light) | Product cards, primary CTA `:active` scale |

**Stack:** prefer `motion/react` for reveals/hovers; GSAP ScrollTrigger only for real pin/scrub sticky stacks. Do not mix both in the same component tree.

**Reduced motion (mandatory):**

- Honor `prefers-reduced-motion`.
- Collapse sticky scrub → static stacked sections.
- No infinite floats, no parallax, no magnetic cursor.
- Crossfades become instant cuts or simple opacity with duration 0.

**Do not:** random GSAP on every heading, marquees more than once, scroll-cue labels, perpetual shimmer.

---

## 5. Hero media (Everyday.io → peis / ild)

**What user liked:** multi-video calming header vs ruegg.swiss / ruegg.no **single** video hero.

### Live observations (everyday.io)

- Full-bleed atmospheric video in the first viewport (product in calm light; muted; autoplay when allowed).
- Second video appears later on the page (not a chaotic multi-grid in hero at crawl time).
- Overall feel: **slow, architectural, quiet** - not spectacle fire-loop marketing.

### Rüegg adaptation

Beat swiss by atmosphere + craft, not by louder fire:

1. **Hero media system:** 2–3 short muted loops (or stills with optional video) of **ember glow / slow flame / installed peis in a real Norwegian room**.
2. **Playback:** crossfade or gentle sequence (8–12s each), never hard cuts every second.
3. **Composition:** full-bleed plane (edge-to-edge). No inset rounded video card in the hero.
4. **Scrim:** soft dark or cream gradient behind type for WCAG contrast.
5. **Fallback:** high-quality still poster if autoplay blocked / reduced motion / slow network.
6. **Mobile:** one clip or still; defer secondary clips.

Compare:

| | ruegg.swiss today | ruegg.no target |
| --- | --- | --- |
| Media | Single looping header webm | Multi-clip calm sequence / crossfade |
| Mood | Brand fire showcase | Quiet domestic heat + design |
| Type | Light Ruegg Sans over media | Plus Jakarta / Ruegg Sans, short Norwegian line |

---

## 6. Catalog interaction (Shopfunner)

**What user liked:** product hover swaps image + description popup.

### Live mechanics (shopfunner.com)

- Product tile: `group relative block`.
- **Two stacked images** (`absolute inset-0`), primary fades out on `group-hover:opacity-0` (~300–500ms).
- Secondary image (stacked packshot / lifestyle angle) revealed underneath.
- **Description panel** sits under the media; title/price bar slides up on hover (`group-hover:-translate-y-…`, ~400ms) revealing a short benefit line + one-sentence description.
- Desktop-only enrichment (`lg:`); mobile keeps static content without hover dependency.

### Rüegg adaptation (lead-gen, not cart)

Use on:

- Homepage bestsellers / “populære modeller”
- `/shop/` (or Norwegian catalog route) product cards

| Funner | Rüegg |
| --- | --- |
| Price + Add to cart energy | **No price checkout / no cart** |
| Colored category popup | Soft **cream / olive** info panel (Swiss tokens) |
| Shop all | **Se modell** + **Be om tilbud** / **Book rådgivning** |

**Card hover spec (implement later):**

1. Default: primary product photo + model name.  
2. Hover (desktop): swap to install/lifestyle image; slide up 1–2 line Norwegian blurb.  
3. CTA in panel or under card: lead intent only.  
4. Touch: tap opens product page or shows blurb inline (no hover-only content that is inaccessible).

---

## 7. Section-by-section mapping

Homepage shell sections → which reference informs polish:

| Shell section | Primary reference | Borrow this |
| --- | --- | --- |
| Navbar | Brunner + Oblica + live ruegg.no | Thin bar, logo, few links, one lead CTA |
| Hero | Everyday + GoDaylight + Swiss | Multi-clip calm media; short headline; 1–2 CTAs; motivated entrance |
| Trust | Oblica / Swiss heritage | Real claims only (Swiss quality, years, partner). No fake counters |
| Benefits | GoDaylight storytelling | Reveal on scroll; one idea per row/block |
| Categories / features | Oblica + Brunner | Large category doors; image-led; clear paths |
| Om Rüegg | Swiss + Brunner | Material / craft voice; homeowner + architect |
| How it works | **GoDaylight** | Sticky or pinned step transitions (motivated) |
| Social / referanser | Oblica projects | Real installs; no Jane Doe quotes |
| Offer / lead | Brunner + Oblica appointment | Be om tilbud / book showroom - not cart |
| Guarantee | Conversion guide (adapted) | Quiet reassurance; no shop “money-back” tone |
| FAQ | Oblica accordion | Clean spacing; one open state |
| Contact | Brunner studio | Form + clear human path |
| Footer | Swiss | Address, legal, social; restrained |
| Catalog cards (`/shop/` + bestsellers) | **Shopfunner** | Hover image swap + description panel |

---

## 8. Do / Don’t (anti-slop)

### Do

- Lock **Swiss cream/ink/olive** palette and official logo treatment.
- Use **professional sans** (Plus Jakarta now; Ruegg Sans if licensed).
- Keep **airy spacing** (density 3).
- Animate only when **motivated** (story / hierarchy / feedback).
- Full-bleed hero media; calm multi-clip approach.
- Catalog hover from Funner adapted to **lead CTAs**.
- Norwegian UI copy for customers; English for code/docs.
- One accent, one radius system, one page theme family.
- `min-h-[100dvh]` for hero (not `h-screen`).

### Don’t

- AI purple / indigo glow gradients.
- Default Inter + slate SaaS look.
- Whimsical display / banned serifs as default.
- Random motion on every element.
- Cart UI, Add to cart, checkout blocks (Strategy A).
- Three equal feature cards as the only layout.
- Eyebrow spam (`uppercase tracking` on every section).
- Em-dash (`—`) in Norwegian UI copy (use hyphen `-` or rewrite).
- Fake stats, “Quietly trusted by”, scroll cues, version stamps.
- Mid-page light↔dark theme flip.
- Pure `#000` / pure `#fff` as primary surfaces.
- Beige+brass “AI cookware” palette (Swiss cream/olive is the brand exception and must stay Swiss-faithful, not generic craft-slop).

---

## 9. What we still need from the user

1. **Official logo files** from ruegg.swiss (SVG + PNG; light/dark if available). Confirm usage rights for .no.
2. **Hero video assets:** 2–3 muted loops (or stills) of peis/ild / installs, or permission to edit swiss media.
3. **Accent confirmation:** keep Norwegian red `#bb0013` or fully adopt Swiss ink/olive CTAs?
4. **Ruegg Sans:** can .no license/use the Swiss webfont, or stick to Plus Jakarta?
5. **Brunner visuals:** site still times out from our Chrome session. Screenshots or VPN capture from boss would help spacing/type fidelity.
6. **More refs (optional):** any extra motion URLs beyond this list.
7. **Showroom / lead CTA final label** in Norwegian (e.g. “Be om tilbud” vs “Book visning”).

---

## Quick implementer checklist

- [ ] Tokens in CSS match Swiss hex table above  
- [ ] Logo SVG in `public/` + wordmark component updated  
- [ ] Display font = sans (no accidental serif)  
- [ ] Section padding follows airy scale  
- [ ] Hero = multi-clip calm media + ≤4 text elements  
- [ ] How-it-works uses motivated sticky/scroll story  
- [ ] Product cards: hover swap + description; lead CTA only  
- [ ] `prefers-reduced-motion` paths for all motion > intensity 3  
- [ ] No cart patterns anywhere on marketing pages  

---

## Reference crawl log (this pass)

| Site | Result | Key takeaway |
| --- | --- | --- |
| https://ruegg.swiss | OK | Olive/cream/ink; Ruegg Sans; single video hero; category carousel |
| https://godaylight.com | OK | Sticky section storytelling; motivated scroll motion |
| https://oblica.com.au | OK | DIN-like sans; 90–120px section rhythm; appointment CTA; category doors |
| https://everyday.io | OK | Calm full-bleed video hero; quiet architectural mood; multi-video on page |
| https://www.shopfunner.com | OK | Dual-image hover + sliding description panel |
| https://brunnerstudio.com | DNS fail | Unreachable |
| https://brunnerstudio.no | Timeout | Unreachable; use prior structure notes |

---

*End of style guide. Next step when ready: apply these rules to the bland homepage shell (design pass), still Strategy A / no cart.*
