# Testing — portfolio-admin

Testing policy enforced (advisory) through `mcp-rules.json`.

## Requirements

1. **Server logic ships tests.** Changes to `src/utilities/**`,
   `src/access/**`, `src/endpoints/**` must add/update `*.test.ts`
   (severity: warning until a runner is wired).
2. **Collections need type + boot verification.** After schema changes:
   `pnpm generate:types` must pass and `pnpm build` must succeed.
3. **No skipped tests.** `describe.skip` / `it.skip` forbidden in landed code.
4. **Behavior over implementation.** Assert access decisions and endpoint
   outputs, not internal call order.

## Running

```bash
pnpm lint          # next lint — must pass
pnpm generate:types # must pass after schema changes
pnpm build         # next build — must pass
# admin health (needs running server + Postgres):
# curl -s "http://localhost:3000/admin/api/tenants?limit=1" | head -c 500
```

## Coverage

No numeric gate. Each new behavior in `utilities`/`access`/`endpoints`
needs at least one test that would fail without it. When adding a test
runner, update this file and `mcp-rules.json` (`requireTest` → `error`).
