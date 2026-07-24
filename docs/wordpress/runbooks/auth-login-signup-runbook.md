# Login/Signup Runbook (WordPress Source of Truth)

This runbook describes how to enable and validate native account login/signup in this frontend while WordPress/WooCommerce stays the customer source of truth.

## 1) Configure environment

Copy `.env.example` to `.env.local` and set:

- `AUTH_SESSION_SECRET`
- `WORDPRESS_AUTH_SHARED_SECRET`
- `WORDPRESS_AUTH_LOGIN_PATH`
- `WORDPRESS_AUTH_SIGNUP_PATH`
- `WORDPRESS_AUTH_ME_PATH`
- `WORDPRESS_AUTH_LOGOUT_PATH`
- `WORDPRESS_AUTH_PASSWORD_REQUEST_PATH`
- `WORDPRESS_AUTH_PASSWORD_RESET_PATH`
- `WORDPRESS_AUTH_PASSWORD_CHANGE_PATH` (optional; defaults to `/wp-json/pb/v1/auth/password/change`)

`NEXT_PUBLIC_WORDPRESS_SITE_URL` (or `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL`) must point to the WordPress origin.

## 2) Install WordPress auth snippet

Deploy `docs/wordpress/snippets/wordpress-pb-auth.php` via the **Code Snippets** plugin (live name: **PB Auth endpoints**, id **58**). Agents use the Code Snippets REST API (`WP_USER` + `WP_APP_PASSWORD` in `.env.local`) — do **not** use mu-plugins.

Full deploy + version checklist: [SNIPPETS.md](../SNIPPETS.md). Repo version must be **1.5.0** (hide order + Min peis `includeLineItems`).

In `wp-config.php`, set the shared secret:

```php
define('PB_AUTH_SHARED_SECRET', 'same-secret-as-WORDPRESS_AUTH_SHARED_SECRET');
```

## 3) Verify WordPress endpoints

Health check:

```bash
curl -X GET "https://your-wordpress-site.no/wp-json/pb/v1/auth/health"
```

Signup:

```bash
curl -X POST "https://your-wordpress-site.no/wp-json/pb/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -H "X-PB-Auth-Secret: YOUR_SECRET" \
  -d '{"email":"test@example.no","password":"SuperSterkt123","firstName":"Test","lastName":"Bruker"}'
```

Login:

```bash
curl -X POST "https://your-wordpress-site.no/wp-json/pb/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-PB-Auth-Secret: YOUR_SECRET" \
  -d '{"email":"test@example.no","password":"SuperSterkt123"}'
```

## 4) Verify frontend API routes

Start app:

```bash
npm run dev
```

Then test:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/password/request-reset`
- `POST /api/auth/password/reset`

## 5) Manual QA checklist

- Open `/min-konto` and verify:
  - user can switch between `Logg inn` and `Opprett konto`
  - user-facing copy is Norwegian
- Signup creates WordPress user with `customer` role (or `subscriber` fallback)
- Existing WordPress user can log in
- `Logg ut` clears session in frontend
- `/min-konto/glemt-passord` sends neutral success response
- `/min-konto/tilbakestill-passord?login=...&key=...` updates password
- `/min-konto/ordrer` lists WooCommerce orders via PB Auth REST
  (`GET /wp-json/pb/v1/auth/orders` — requires PB Auth snippet **1.5.0**)
- Hide order (failed/cancelled/refunded) uses
  `POST /wp-json/pb/v1/auth/orders/{id}/hide` (**1.5.0**)
- `/min-konto/min-peis` needs completed orders with line items
  (`includeLineItems=1` — **1.5.0**)
- `/min-konto/ordrer/[id]` loads a single owned order via
  `GET /wp-json/pb/v1/auth/orders/{id}`
- `Betal ordre` uses `GET /api/account/orders/{id}/pay` (Next.js), which mints
  a one-time SSO code (`POST /wp-json/pb/v1/auth/sso-code`) and redirects via
  `GET /wp-json/pb/v1/auth/sso?code=...` — WordPress logs the customer in and
  opens the order-pay page directly (no login form)
- `/min-konto/adresser` view/edit billing + shipping
  (`GET`/`PUT /wp-json/pb/v1/auth/addresses`)
- `/min-konto/betalingsmetoder` list/delete/set-default saved payment tokens
  (`GET`/`DELETE`/`POST .../payment-methods`)
- `/min-konto/passord` changes password while logged in
- Navbar account icon navigates to `/min-konto`

Orders/addresses/payment methods use thin WooCommerce PHP APIs in the PB Auth
snippet (not WooGraphQL). Confirm after updating the snippet:

```bash
curl -sS "https://your-wordpress-site.no/wp-json/pb/v1/auth/health" | jq .snippetVersion
# expect "1.5.0"
```

**Secrets:** snippets include the shared secrets for paste-and-go installs during
release testing. You can still override in `wp-config.php` with
`define('PB_AUTH_SHARED_SECRET', '...')` if needed.

## 6) Common issues

- `WORDPRESS_UNAVAILABLE`: WordPress URL/path mismatch, secret mismatch, or WP snippet missing.
- Always unauthorized on `me`: token expired or invalidated in WordPress transients.
- Reset flow fails: invalid `login` + `key` pair from WordPress reset email link.
