# Peisbutikken Frontend

Next.js frontend for Peisbutikken, deployed on Cloudflare. Integrates with WordPress/WooCommerce via GraphQL.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix Vega)
- **State:** Zustand
- **Deployment:** OpenNext + Cloudflare Workers (manual WSL; see below)

---

## Source control & deploy

- **No GitHub Actions / no GitHub-hosted CI/CD.** Do not add `.github/workflows`.
- **GitHub** stores the repo as a safety backup (and for PRs/history). It does **not** build or deploy.
- **Release gates** run locally: `npm run release:check`, then `npm run release:build:verify` (WSL).
- **Production deploy** is manual on Linux/WSL: `bash scripts/deploy-linux-wsl.sh` (authorized only). See [`CLOUDFLARE.md`](CLOUDFLARE.md) and [`docs/runbooks/cloudflare-release-preflight.md`](docs/runbooks/cloudflare-release-preflight.md).

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ (LTS recommended)
- **npm** (used in this project), or pnpm/yarn/bun
- **Git**
- **Cursor** (optional but recommended — we mainly use Cursor AI for development)

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/ETI-Norge/peisbutikken-frontend.git
cd peisbutikken-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with these required variables:

- **NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL** — WordPress headless WooCommerce GraphQL endpoint
- **EMAIL** — shadcn/studio premium registries (for adding premium components)
- **LICENSE_KEY** — shadcn/studio premium registries

> **Tip:** Copy `.env.example` to `.env.local` and fill in the values. Ask a teammate for the correct credentials.

For native customer login/signup integration, also configure:

- `AUTH_SESSION_SECRET`
- `WORDPRESS_AUTH_SHARED_SECRET`
- `WORDPRESS_AUTH_LOGIN_PATH`
- `WORDPRESS_AUTH_SIGNUP_PATH`
- `WORDPRESS_AUTH_ME_PATH`
- `WORDPRESS_AUTH_LOGOUT_PATH`
- `WORDPRESS_AUTH_PASSWORD_REQUEST_PATH`
- `WORDPRESS_AUTH_PASSWORD_RESET_PATH`

See `docs/auth-login-signup-runbook.md` for WordPress snippet setup and validation steps.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verify the setup

- The dev server should start without errors.
- If you see GraphQL errors, check that `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` points to a valid WordPress GraphQL endpoint.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (with OpenNext/Cloudflare dev init) |
| `npm run build` | Build for production |
| `npm start` | Run production build locally |
| `npm run lint` | Run ESLint |
| `npm run release:check` | Local release gates (no deploy; no GitHub CI) |
| `npm run release:build:verify` | WSL OpenNext build + wrangler dry-run only |
| `npm run build:cloudflare` | Build for Cloudflare (OpenNext) |
| `npm run preview` | Build + preview Cloudflare deployment locally |
| `npm run deploy` | Linux-only OpenNext deploy (use WSL script from Windows) |
| `npm run cf-typegen` | Generate Cloudflare env types |

---

## Contributing

We use a simple Git workflow with feature branches and pull requests.

### 1. Ensure you're on `main` and up to date

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

Use a descriptive branch name. Common patterns:

- `feature/short-description` — new features
- `fix/short-description` — bug fixes
- `refactor/short-description` — refactoring

```bash
git checkout -b feature/add-product-filter
```

### 3. Make your changes

- Write code following the project conventions (see `.cursor/rules/` for AI-assisted guidance).
- Run `npm run lint` before committing.
- Keep commits focused and atomic.

### 4. Commit and push

```bash
git add .
git commit -m "feat: add product filter by category"
git push -u origin feature/add-product-filter
```

### 5. Open a Pull Request

1. Go to the repository on [GitHub](https://github.com/ETI-Norge/peisbutikken-frontend).
2. Create a Pull Request from your branch into `main`.
3. Add a clear description of what changed and why.
4. Request review if your team uses code review.

### 6. Merge

- After approval (if required), merge the PR.
- Prefer **Squash and merge** or **Rebase and merge** to keep `main` history clean.
- Delete the branch after merging.

### 7. Update your local `main`

```bash
git checkout main
git pull origin main
```

---

## Development with Cursor AI

We mainly use **Cursor** for development. The project includes Cursor rules in `.cursor/rules/` that guide AI-assisted coding:

- **Effect-last:** Avoid `useEffect` for normal logic; prefer derived state and event handlers.
- **shadcn preferred:** Use shadcn/ui components from `@/components/ui/` instead of building from scratch.
- **Norwegian for users:** UI copy, labels, and user-facing text should be in Norwegian (Bokmål).
- **Everything is a component:** Structure UI as named, exportable components; pages compose components only.

When working with Cursor:

1. Open the project in Cursor.
2. Use `@` to reference files, folders, or rules when asking for changes.
3. The AI will follow the rules in `.cursor/rules/` automatically.
4. Run `npm run lint` and fix any issues before committing.

---

## Project Structure

```
├── app/              # Next.js App Router (pages, layouts, API routes)
├── components/       # React components (UI, features)
├── lib/              # Utilities, GraphQL client, WordPress URLs
├── hooks/            # Custom React hooks
├── .cursor/rules/    # Cursor AI rules for this project
└── wrangler.jsonc    # Cloudflare Workers config
```

---

## Deployment

The app is built with OpenNext and deployed to Cloudflare Workers. See `wrangler.jsonc` for configuration. Use `npm run deploy` to build and deploy (requires Cloudflare credentials).

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [OpenNext for Cloudflare](https://opennext.js.org/docs/cloudflare)
