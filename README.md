# Open Checklist Project

Open Checklist Project is a Cloudflare-hosted trading card checklist browser and API. It provides a React UI for browsing card sets, viewing cards, and validating checklist JSON against versioned schemas, backed by a Hono Worker API, Cloudflare D1, R2, and KV.

The project is built around open, structured checklist data for collectors, developers, and trading card tools.

## Current Stack

- React 19 + Vite for the browser UI
- React Router for client-side routes
- Hono for the Cloudflare Worker API
- Cloudflare D1 for structured set and card records
- Cloudflare R2 for JSON schema storage and downloadable data objects
- Cloudflare KV for schema caching
- AJV for JSON schema validation
- Wrangler for local development, migrations, and deployment

## App Routes

- `/` - browse sets
- `/sets/:set_id` - view a set and its cards
- `/cards/:uuid` - view an individual card
- `/validate` - paste card or set JSON and validate it against the R2-backed schemas

## API Routes

The Worker entrypoint is [src/index.ts](src/index.ts).

- `GET /api` - API health and schema version metadata
- `GET /api/sets` - list sets
- `GET /api/sets/:set_id` - get a set with its cards
- `POST /api/sets` - validate and insert a set
- `GET /api/cards` - list cards
- `GET /api/cards/:uuid` - get a card
- `POST /api/cards` - validate and insert a card
- `POST /api/validate?type=card|set` - validate JSON without inserting it
- `GET /api/download/:key` - download an object from R2

Supported set/card filters include `genre`, `sport`, `category`, `search`, `limit`, and `offset` where applicable.

## Cloudflare Resources

The configured Cloudflare bindings are in [wrangler.json](wrangler.json).

| Binding | Product | Resource |
| --- | --- | --- |
| `DB` | D1 | `open-checklist-db` |
| `DATA_BUCKET` | R2 | `open-checklist-data` |
| `SCHEMA_CACHE` | KV | schema cache namespace |
| `ASSETS` | Workers Assets | built React client |

## Database

The initial D1 migration is:

[migrations/0001_create_sets_and_cards.sql](migrations/0001_create_sets_and_cards.sql)

It creates:

- `sets`
- `cards`
- indexes for genre, set id, series, release date, sport, card number, rookie cards, and card name

Apply migrations to the remote D1 database with:

```bash
npx wrangler d1 migrations apply open-checklist-db --remote
```

Inspect the remote schema with:

```bash
npx wrangler d1 execute open-checklist-db --remote --command "SELECT type, name, tbl_name FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY type, name;"
```

## Checklist Data

Completed checklist YAML is tracked under:

[data/baseball](data/baseball)

Current migrated data:

| Set | Cards |
| --- | ---: |
| `2023-topps-series-1` | 2 |
| `2025-26-topps-chrome-platinum` | 970 |
| `2025-26-topps-definitive-collection` | 1,229 |
| `2025-26-topps-transcendent` | 1,140 |
| `2026-bowman` | 1,240 |
| `2026-donruss` | 1,199 |
| `2026-panini-prizm-stars-stripes` | 1,185 |
| `2026-topps-chrome-black` | 542 |
| `2026-topps-series-2` | 3,468 |

Total: 9 sets and 10,975 cards.

Use the migration utility to validate YAML and generate D1 seed SQL:

```bash
npm run data:summary
npm run data:validate
npm run data:write-sql
```

The generated SQL is written to `.wrangler/open-checklist-seed.sql`, which is ignored by Git.

Refresh remote D1 from the tracked YAML:

```bash
npm run data:import:remote
```

The import deletes and replaces only the set IDs present in `data/`, leaving unrelated D1 rows alone.

## R2 Schemas

The JSON schemas are tracked in:

- [schema/cards.json](schema/cards.json) - Card schema v0.1
- [schema/set.json](schema/set.json) - Set schema v0.2

They are uploaded to R2 at:

- `open-checklist-data/schema/cards.json`
- `open-checklist-data/schema/set.json`

Upload or refresh them with:

```bash
npx wrangler r2 object put open-checklist-data/schema/cards.json --file schema/cards.json --content-type application/schema+json --remote
npx wrangler r2 object put open-checklist-data/schema/set.json --file schema/set.json --content-type application/schema+json --remote
```

The Worker loads schemas from R2 and caches them in KV under versioned keys.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app locally:

```bash
npm run dev
```

The default local URL is:

```text
http://localhost:5173/
```

Build the project:

```bash
npm run build
```

Run the full project check:

```bash
npm run check
```

`npm run check` runs TypeScript, builds the Vite client and Worker, and performs a Wrangler deploy dry run.

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Before deploying a fresh environment, confirm:

1. D1 migrations have been applied.
2. `schema/cards.json` and `schema/set.json` have been uploaded to R2.
3. `wrangler.json` points at the intended D1, R2, and KV resources.

## Data Model Notes

Sets use `set_id` as their public stable identifier. Cards reference sets through `cards.set_id`.

JSON-shaped fields are stored as text in D1 and hydrated by the API:

- `sets.category`
- `sets.sports`
- `sets.years`
- `sets.metadata`
- `cards.subjects`
- `cards.sports`
- `cards.external_links`
- `cards.metadata`

Boolean fields are stored as integer flags in D1 and returned as booleans by the API.

## Project Goals

- Make reliable, structured checklist data easier to browse and validate.
- Provide open card and set schemas for consistent data contribution.
- Support sports, TCG, and non-sport card data.
- Keep raw schema/data storage in R2 while indexing queryable records in D1.
- Provide a contributor-friendly validation path before inserting data.

## Next Work

- Add data import tooling for bulk checklist ingestion.
- Add richer empty, loading, and error states in the UI.
- Add pagination controls and search inputs to the browser views.
- Add API documentation with example payloads.
- Add tests around schema validation and API hydration.
