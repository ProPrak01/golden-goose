# Reviewer workflow plan

## Primary review method

The primary review method will be local, using Bun, Docker-compatible local Supabase, and the Next.js application.

## Intended command sequence

```bash
bun install
bun run infra:start
bun run db:reset
bun run db:types
bun run seed
bun run dev
```

In a second terminal:

```bash
bun run eval
bun run check
```

## Required final documentation

`RUN.md` will state:

1. runtime versions and Docker requirement;
2. every environment variable;
3. dependency-install command;
4. infrastructure start, migration, and seed commands;
5. application start command and URL;
6. primary product interactions to try;
7. evaluation command;
8. new-corpus import procedure;
9. locations for database state and evaluation results;
10. full reset command;
11. model-provider configuration, if enabled.

## Clean-review acceptance test

Before submission, a clean environment must be able to install dependencies, start infrastructure, reset and seed the database, run the application, import a corpus, inspect memory state, run evaluation, view reports, and reset again without undocumented intervention.
## Local data

Start local Supabase, reset the schema, then load the deterministic fixtures:

```bash
bun run infra:start
bun run db:reset
bun run seed
```

The seed creates one supported deadline memory and one deliberately rejected inferred-trait case. This lets reviewers inspect both the accepted evidence path and the safety boundary.
