---
id: "0001"
title: "Multi-tenant data model via Payload plugin"
status: accepted
date: 2026-10-01
---

# ADR-0001: Multi-tenant data model via Payload plugin

## Context

One Payload backend serves multiple portfolio sites (`Tenants`). Plain
relationship fields do not scope collections to tenants, and plugin
ordering interacts badly with the form-builder plugins.

## Decision

Tenant scoping goes through `multiTenantPlugin` in `src/plugins/`: every
tenant-owned collection is listed in its `collections` array, and the
plugin is registered **below** the form plugins (`form`,
`form-submission`).

## Consequences

- Adding a tenant collection means editing `src/plugins/` in the same
  change set — enforced by `mcp-rules.json` (`multitenant-governed`).
- Reordering plugins requires superseding this ADR.
- Access functions in `src/access/` assume tenant context exists.
