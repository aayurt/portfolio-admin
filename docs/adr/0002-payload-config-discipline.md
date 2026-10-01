---
id: "0002"
title: "Payload config and migrations discipline"
status: accepted
date: 2026-10-01
---

# ADR-0002: Payload config and migrations discipline

## Context

`src/payload.config.ts` wires collections, globals, plugins, and the
Postgres adapter. Schema drift between code, `payload-types.ts`, and
`src/migrations/**` breaks builds and deploys.

## Decision

Collection schema changes ship with regenerated `src/payload-types.ts`
(`pnpm generate:types`) and a migration when storage-affecting, in the
same change set. Sharp stays pinned per `package.json` (`onlyBuiltDependencies`).

## Consequences

- `mcp-rules.json` (`payload-upgrade-governed`) requires referencing
  this ADR for `payload.config.ts` / `migrations` changes.
- CI/Jules validation runs `generate:types` + `build` to catch drift.
