# Conventions — portfolio-admin

Coding and naming conventions. `CONTRIBUTING.md` covers workflow; this
file covers the code itself.

## Naming

- Files/dirs: `kebab-case` for utilities, `PascalCase` for collections
  dirs (`Abouts/`, `Galleries/`) matching existing layout.
- Types/components: `PascalCase`. Functions/variables: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Tests mirror the file they test: `getURL.test.ts` next to `getURL.ts`.

## Code style

- TypeScript strict. Prettier + ESLint (`next lint`). Run
  `pnpm lint` before commit; `pnpm lint:fix` to autofix.
- One responsibility per module; collections define `slug`, schema,
  access, and hooks in one place.
- Access functions return `boolean` or Payload query constraints —
  never throw for denied access.
- No secrets or absolute paths in source; config from env
  (`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`).
- Tailwind for admin-adjacent UI; `components.json` (shadcn) is the
  source of truth for component aliases.

## Commits

- Imperative mood, 50-char subject, body explains *why*.
- Reference ADR numbers when relevant (`Implements ADR-0001`).
- Regenerate types (`pnpm generate:types`) in the same commit as any
  collection schema change.

## Documentation

- Architecturally significant decisions get an ADR in `docs/adr/`.
- Collections and access functions get doc comments.
