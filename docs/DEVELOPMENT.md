# Development — portfolio-admin

Day-to-day workflow. Policy in `CONTRIBUTING.md`; ops in `RUNBOOK.md`.

## Setup

```bash
pnpm install
cp .env.example .env   # set DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
pnpm dev               # http://localhost:3000/admin
```

Requires Postgres reachable at `DATABASE_URI`. After any collection
schema change:

```bash
pnpm generate:types    # regenerates src/payload-types.ts
```

## Daily loop

1. Pick an issue; check `mcp-rules.json` for ADR-governed paths
   (`collections`, `plugins`, `access` → ADR-0001).
2. Branch, implement, verify.
3. Run `validate_change` (via the `kritikka` MCP server) on your change set.
4. Open a PR per `CONTRIBUTING.md`.

## Common tasks

| Task | How |
|---|---|
| Add a collection | `src/collections/<Name>/`, register in `payload.config.ts` + `multiTenantPlugin` `collections` array |
| Add tenant scoping | Edit `src/plugins/`, keep multi-tenant plugin **below** form plugins |
| Add an endpoint | `src/endpoints/`, wire in collection or `payload.config.ts` |
| Types | `pnpm generate:types` |
| Import map | `pnpm generate:importmap` |
| Lint | `pnpm lint` |
| Build | `pnpm build` (then `pnpm postbuild` for sitemap) |

## MCP server

Read-only advisor over this repo. Root resolves from `--root`, then
`KRITTIKA_MCP_ROOT`, then cwd. Rules come from `mcp-rules.json`.
