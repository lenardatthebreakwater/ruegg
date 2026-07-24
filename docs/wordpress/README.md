# WordPress docs (Peisbutikken headless)

- **[SNIPPETS.md](./SNIPPETS.md)** — snippet inventory, versions, and **Code Snippets API** deploy (agent path)
- **snippets/** — PHP sources of truth (deploy via Code Snippets API; never mu-plugins)
- **runbooks/** — feature-specific setup and QA

**Deploy convention:** agents update live snippets with `WP_USER` + `WP_APP_PASSWORD` in `.env.local` against `https://peisbutikken.no/wp-json/code-snippets/v1`. Humans only paste in WP Admin if the API is unavailable. See [SNIPPETS.md](./SNIPPETS.md).
