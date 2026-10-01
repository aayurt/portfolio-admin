# Contributing — portfolio-admin

How humans (and Jules) contribute. Code style is in
`docs/CONVENTIONS.md`; workflow for agents is in `AGENTS.md`.

## Setup

```bash
pnpm install
cp .env.example .env   # DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
pnpm dev               # needs Postgres at DATABASE_URI
```

## Pull requests

1. Branch from `main`, keep diffs minimal and focused.
2. Run before pushing:
   ```bash
   pnpm lint
   pnpm generate:types
   pnpm build
   ```
3. If you touched `src/collections/**`, `src/plugins/**`, or
   `src/access/**`, reference ADR-0001. If you touched
   `src/payload.config.ts` or `src/migrations/**`, reference ADR-0002.
4. Never commit `.env`, `serviceAccountKey.json`, `.next/`, or
   `node_modules/`.

## Reviews

- Architecture changes need an ADR (copy
  `docs/adr/0000-template.md`, `proposed` → `accepted`).
- `validate_change` (kritikka MCP) must show no `error` violations.
