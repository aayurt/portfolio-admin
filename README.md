# Portfolio Admin (Payload CMS)

Multi-tenant Payload backend for the portfolio sites. Serves the admin UI at
`/admin/` and the content API at `/admin/api/` (consumed by `portfolio-front`).

## Tenant gotcha

To add a collection under a tenant, a plain relationship field fails — add the
collection to the `collections` array of `multiTenantPlugin` in
`src/plugins/` instead. The multi-tenant plugin must be registered **below**
the form plugins (`form`, `form-submission`) or they stop working.

## Develop

```sh
pnpm install
pnpm dev            # http://localhost:3000/admin
pnpm generate:types # regenerate src/payload-types.ts after schema changes
```

## Deploy

See [DEPLOY.md](./DEPLOY.md):

```sh
sh scripts/deploy-standalone.sh PersonalVPS
```
