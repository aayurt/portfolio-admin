# Deployment — portfolio-admin

Payload CMS backend. Serves the admin UI at `/admin/` and the content API at
`/admin/api/` (consumed by `portfolio-front`). Proxied by nginx to port 3001.

## Servers

| Alias (ssh)   | Role  | Deploy dir                 | pm2 app                  | Port |
|---------------|-------|----------------------------|--------------------------|------|
| `PersonalVPS` | prod  | `/var/www/portfolio-admin` | `multi-tenant-portfolio` | 3001 |

Front lives at `/var/www/portfolio` (see `portfolio-front/DEPLOY.md`).
SSH entry: `ssh PersonalVPS`.

## Deploy

Build locally, ship the standalone bundle to the selected server:

```sh
sh scripts/deploy-standalone.sh                 # interactive server picker
sh scripts/deploy-standalone.sh PersonalVPS     # direct
```

What it does:

1. `pnpm install --frozen-lockfile` + `pnpm run build` (uses your local `.env`).
2. Assembles `.next/standalone/` (+ `public/`, `.next/static`).
3. rsyncs the bundle to `<server>:/var/www/portfolio-admin/.next/standalone/`
   (server `.env` is never overwritten).
4. Rebuilds `sharp` **on the server under Node 24** (ABI-tied native binding —
   a Node 18 build segfaults silently seconds after boot under Node 24).
5. Syncs `ecosystem.config.cjs`, reloads (or starts) pm2, saves the list.
6. Health-checks `http://localhost:3001/admin/api/tenants?limit=1`.

## Environment

* Build-time: local `.env` (`NEXT_PUBLIC_SLUG`, etc.). Never commit secrets —
  `.env` is gitignored.
* Runtime: server `/var/www/portfolio-admin/.env` (`DATABASE_URI`,
  `PAYLOAD_SECRET`, …). The deploy never syncs `.env`.

## Verify

```sh
curl -sk -o /dev/null -w "%{http_code}\n" https://aayurtshrestha.com.np/admin/
ssh PersonalVPS "pm2 describe multi-tenant-portfolio | grep -E 'status|uptime|restarts'"
```

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Cannot find module .../standalone/server.js`, thousands of restarts | No successful build was ever deployed. Run the deploy script. |
| `ReferenceError: File is not defined` | Running under Node 18. `ecosystem.config.cjs` pins `interpreter` to Node 24 — never remove it. |
| Worker Ready, then silent death ~2s later, empty stderr | sharp built for the wrong Node ABI (segfault). Re-run step 4 of the script. |
| `pm2` runs the wrong Node despite `interpreter` | pm2 ignores `interpreter` in `cluster` mode — the config uses `fork`, keep it. |
| Front shows "Server Components render" error | This admin unreachable (`Bad Gateway` in front logs). Fix here, not in the front. |
