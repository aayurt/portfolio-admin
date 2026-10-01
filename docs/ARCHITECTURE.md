# Architecture — portfolio-admin

Multi-tenant Payload CMS backend. Serves the admin UI at `/admin/` and the
content API at `/admin/api/` (consumed by `portfolio-front`).

Binding decisions live in `docs/adr/`; this document states the standing
rules any change must respect.

## Rules

1. **Tenants go through the multi-tenant plugin.** To add a collection
   under a tenant, add it to the `collections` array of
   `multiTenantPlugin` in `src/plugins/` — a plain relationship field
   fails. The plugin must be registered **below** the form plugins
   (`form`, `form-submission`) or they stop working.
2. **Data model is governed.** `src/collections/**`, `src/plugins/**`,
   `src/access/**` are governed by ADR-0001. Config/migrations
   (`src/payload.config.ts`, `src/migrations/**`) are governed by
   ADR-0002.
3. **Docs are the contract.** A change that contradicts
   `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, or `docs/TESTING.md`
   must update them in the same change set.
4. **Boundary discipline.** Never read or write outside the repo root.
   Never touch `.env`, `serviceAccountKey.json`, `.next/`, or
   `node_modules/`. Secrets come from env, never source.
5. **Layer direction is mechanical.** `mcp-rules.json` declares
   `app → engine → foundation`; `validate_architecture` fails on
   outward imports.

## Layering

- `src/app/**`, `src/collections/**`, `src/endpoints/**`,
  `src/plugins/**`, `src/payload.config.ts`, `src/migrations/**` — App:
  routes, collections, custom endpoints, plugin wiring, Payload config.
  Depends on engine + foundation.
- `src/fields/**`, `src/hooks/**`, `src/blocks/**`, `src/heros/**`,
  `src/components/**`, `src/Footer/**`, `src/Header/**` — Engine:
  reusable fields, hooks, blocks.
- `src/access/**`, `src/utilities/**`, `src/search/**` — Foundation:
  access control, URL helpers, search wiring. Imports nothing above it.
- `scripts/deploy-standalone.sh` — Sole deploy path (see `DEPLOY.md`).

## Changing the architecture

Copy `docs/adr/0000-template.md`, fill it in, follow
proposed → accepted → superseded before implementing.
