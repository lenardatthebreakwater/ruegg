# SEO Metadata System Checklist

Use this checklist whenever a new production storefront route is created or existing metadata is changed.

## Scope

- Applies to production storefront routes under `app/`.

## Route Metadata Checklist

- Use `generateMetadata` + `buildPageMetadata` from `lib/seo/metadata.ts`.
- Provide route-specific `title`, `description`, and canonical `path`.
- Set `socialImage` when page-specific image exists (otherwise default OG image is used).
- Add `robots` override only when route should not use default index/follow behavior.
- Do not hardcode `<meta>` tags in page components.

## Structured Data Checklist

- Reuse `components/seo/json-ld-script.tsx` for all JSON-LD output.
- Use helpers from `lib/seo/schema.ts` (`WebSite`, `Organization`, `LocalBusiness`, `Breadcrumb`, `Product`, `CollectionPage`, `ContactPage`, `FAQ`).
- Keep schema content aligned with visible page content.
- `/kontakt-oss`: emit `ContactPage` and `LocalBusiness` (with store address) alongside `BreadcrumbList` and `HomeGoodsStore`.

## Production Coverage Baseline

The following production pages must continue using centralized metadata:

- Home: `/`
- Product archive and filters: `/produkter`, `/produktkategori/*`, `/merke/*`, `/reservedeler/*`, `/tilbud`
- Product detail: `/produkter/[slug]`
- Service/information pages: `/kontakt-oss`, `/montering`, `/piperehabilitering`, `/populaere-sok`
- Legal and policy pages: `/salgsbetingelser`, `/fraktbetingelser`, `/personvernserklaering`
- Account pages: `/min-konto`, `/min-konto/glemt-passord`, `/min-konto/tilbakestill-passord`

## Validation Workflow

1. Run `npm run lint`.
2. Run `npm run build`.
3. Verify in browser page source/devtools:
   - canonical link
   - Open Graph tags (including image)
   - Twitter tags (including image)
   - robots metadata where relevant
   - JSON-LD scripts
4. Validate schema pages with Google Rich Results Test.
