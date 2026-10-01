# Agent Instructions — portfolio-admin

Rules for AI agents (Jules, Claude, OpenCode, Hermes) working in this
repo. Read this file first, alongside `docs/ARCHITECTURE.md`.

## Setup commands (Jules + local)

- Install deps: `pnpm install` (Node >= 20, pnpm 10; Jules VM has Node preinstalled — see `scripts/setup-jules.sh`)
- Env: `cp .env.example .env` (`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`); needs Postgres at `DATABASE_URI`
- Dev server: `pnpm dev` (http://localhost:3000/admin)
- Types: `pnpm generate:types` — run after any collection schema change
- Lint: `pnpm lint` — must pass
- Build: `pnpm build` — must pass

Jules setup: paste `scripts/setup-jules.sh` into the Jules repo
Configuration → Initial Setup box, then Run & Snapshot. The script
skips boot without `DATABASE_URI` (Jules VMs have no Postgres by
default) but still validates install + types + build where possible.

## Non-negotiables (kritikka)

1. **Read before write.** Fetch `get_architecture_rules`,
   `get_conventions`, and `get_current_adrs` (via the `kritikka` MCP
   server) before proposing or making any change.
2. **Validate every change.** Pass the change set through
   `validate_change` before writing files. Do not land `error`-severity
   violations.
3. **Respect the boundary.** Never write outside the repo root. Never
   touch `.env*`, `serviceAccountKey.json`, `.next/`, `node_modules/`.
4. **ADR-first.** `src/collections/**`, `src/plugins/**`,
   `src/access/**` → ADR-0001; `src/payload.config.ts`,
   `src/migrations/**` → ADR-0002. Reference the ADR in the PR.
5. **Tenant gotcha.** New tenant collections go in the
   `multiTenantPlugin` `collections` array in `src/plugins/`, and the
   plugin stays **below** the form plugins.

## Working style

- Keep diffs minimal; Prettier + ESLint (`pnpm lint`, `pnpm lint:fix`).
- Access functions return `boolean`/query constraints, never throw for deny.
- Schema change = `pnpm generate:types` in the same commit.
- Sharp is ABI-pinned (`onlyBuiltDependencies`); never bump blindly.
- If a tool returns `{ "found": false }`, report and stop — do not invent.

## Before finishing (Jules + human PRs)

```
pnpm lint && pnpm generate:types && pnpm build
```

Title format: `[admin] <Title>`. Deploy is out of scope (see `DEPLOY.md`).
