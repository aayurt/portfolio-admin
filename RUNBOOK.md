# Runbook — portfolio-admin

Operational procedures. Dev workflow in `docs/DEVELOPMENT.md`.

## Daily operations

- **Health check.**
  `curl "http://localhost:3001/admin/api/tenants?limit=1"` after boot.
- **Log triage.** Storage issues → ADR-0001 context; config/migration
  issues → ADR-0002 context.

## Deployment

Follow `DEPLOY.md` (`scripts/deploy-standalone.sh`). Roll back by
redeploying the previous known-good bundle.

Key gotchas (see `DEPLOY.md`):

- Rebuild `sharp` **on the server under Node 24** (ABI-tied).
- `ecosystem.config.cjs` uses `fork` mode + Node 24 `interpreter`.
- Server `.env` is never overwritten by deploys.

## Maintenance windows

Schema or storage-engine migrations (ADR-0002 scope) require a
maintenance window and a tested rollback path.

## Escalation

1. Reproduce with `pnpm build`.
2. Check `DEPLOY.md` troubleshooting table.
3. Open an incident and page on-call if unresolved.
