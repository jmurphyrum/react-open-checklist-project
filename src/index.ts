import { Hono } from "hono";
import { cors } from "hono/cors";
import Ajv from "ajv";

type Bindings = {
  DB: D1Database;
  DATA_BUCKET: R2Bucket;
  SCHEMA_CACHE: KVNamespace;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.get("/api", (c) =>
  c.json({
    project: "open-checklist-api",
    version: "0.2.0",
    schemas: { card: "0.1", set: "0.2" },
  }),
);

app.get("/api/sets", async (c) => {
  const { genre, sport, category, search, limit = "50", offset = "0" } = c.req.query();

  let sql = "SELECT * FROM sets WHERE 1=1";
  const params: (string | number)[] = [];

  if (genre) {
    sql += " AND genre = ?";
    params.push(genre);
  }
  if (sport) {
    sql += " AND EXISTS (SELECT 1 FROM json_each(sports) WHERE value = ?)";
    params.push(sport);
  }
  if (category) {
    sql += " AND EXISTS (SELECT 1 FROM json_each(category) WHERE value = ?)";
    params.push(category);
  }
  if (search) {
    sql += " AND (name LIKE ? OR set_id LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY release_date DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  const sets = (results || []).map(hydrateSet);

  return c.json({ sets, limit: parseInt(limit), offset: parseInt(offset) });
});

app.get("/api/sets/:set_id", async (c) => {
  const setId = c.req.param("set_id");
  const set = await c.env.DB.prepare("SELECT * FROM sets WHERE set_id = ?").bind(setId).first();
  if (!set) return c.json({ error: "Set not found" }, 404);

  const { results: cards } = await c.env.DB.prepare(
    "SELECT * FROM cards WHERE set_id = ? ORDER BY CASE WHEN number GLOB '[0-9]*' THEN 0 ELSE 1 END, CAST(number AS REAL), number",
  )
    .bind(setId)
    .all();

  return c.json({
    ...hydrateSet(set),
    cards: (cards || []).map(hydrateCard),
  });
});

app.post("/api/sets", async (c) => {
  const body = await c.req.json();
  const valid = await validateAgainstSchema(c.env, body, "set");
  if (!valid.valid) return c.json({ error: "Validation failed", details: valid.errors }, 400);

  try {
    await c.env.DB.prepare(`
      INSERT INTO sets (uuid, set_id, name, genre, category, sports, season, years, parallel, insert_set, autograph, relic, base_set, series, series_number, release_date, manufacturer, card_count, print_run, subset, description, image_url, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        body.uuid,
        body.set_id,
        body.name,
        body.genre,
        JSON.stringify(body.category || []),
        body.sports ? JSON.stringify(body.sports) : null,
        body.season || null,
        body.years ? JSON.stringify(body.years) : null,
        body.parallel ? 1 : 0,
        body.insert ? 1 : 0,
        body.autograph ? 1 : 0,
        body.relic ? 1 : 0,
        body.base_set || null,
        body.series || null,
        body.series_number || null,
        body.release_date || null,
        body.manufacturer || null,
        body.card_count || null,
        body.print_run || null,
        body.subset || null,
        body.description || null,
        body.image_url || null,
        body.metadata ? JSON.stringify(body.metadata) : null,
      )
      .run();
    return c.json({ success: true, set_id: body.set_id }, 201);
  } catch (e: unknown) {
    return c.json({ error: getErrorMessage(e) }, 409);
  }
});

app.get("/api/cards", async (c) => {
  const { set_id, genre, sport, rookie, search, limit = "50", offset = "0" } = c.req.query();

  let sql = "SELECT * FROM cards WHERE 1=1";
  const params: (string | number)[] = [];

  if (set_id) {
    sql += " AND set_id = ?";
    params.push(set_id);
  }
  if (genre) {
    sql += " AND genre = ?";
    params.push(genre);
  }
  if (sport) {
    sql += " AND (sport = ? OR EXISTS (SELECT 1 FROM json_each(sports) WHERE value = ?))";
    params.push(sport, sport);
  }
  if (rookie) {
    sql += " AND rookie_card = 1";
  }
  if (search) {
    sql +=
      " AND (card_name LIKE ? OR number LIKE ? OR EXISTS (SELECT 1 FROM json_each(subjects) WHERE json_extract(value, '$.name') LIKE ?))";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY CASE WHEN number GLOB '[0-9]*' THEN 0 ELSE 1 END, CAST(number AS REAL), number LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({ cards: (results || []).map(hydrateCard), limit: parseInt(limit), offset: parseInt(offset) });
});

app.get("/api/cards/:uuid", async (c) => {
  const card = await c.env.DB.prepare("SELECT * FROM cards WHERE uuid = ?").bind(c.req.param("uuid")).first();
  if (!card) return c.json({ error: "Card not found" }, 404);
  return c.json(hydrateCard(card));
});

app.post("/api/cards", async (c) => {
  const body = await c.req.json();
  const valid = await validateAgainstSchema(c.env, body, "card");
  if (!valid.valid) return c.json({ error: "Validation failed", details: valid.errors }, 400);

  try {
    await c.env.DB.prepare(`
      INSERT INTO cards (uuid, number, genre, sport, sports, set_id, subjects, card_name, description, series, set_number, subset, variation, parallel, print_run, serial_numbered, autograph, relic, rookie_card, release_date, image_url, external_links, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        body.uuid,
        body.number,
        body.genre,
        body.sport || null,
        body.sports ? JSON.stringify(body.sports) : null,
        body.set_id,
        JSON.stringify(body.subjects),
        body.card_name || null,
        body.description || null,
        body.series || null,
        body.set_number || null,
        body.subset || null,
        body.variation || null,
        body.parallel || null,
        body.print_run || null,
        body.serial_numbered ? 1 : 0,
        body.autograph ? 1 : 0,
        body.relic ? 1 : 0,
        body.rookie_card ? 1 : 0,
        body.release_date || null,
        body.image_url || null,
        body.external_links ? JSON.stringify(body.external_links) : null,
        body.metadata ? JSON.stringify(body.metadata) : null,
      )
      .run();
    return c.json({ success: true, uuid: body.uuid }, 201);
  } catch (e: unknown) {
    return c.json({ error: getErrorMessage(e) }, 409);
  }
});

app.post("/api/validate", async (c) => {
  const body = await c.req.json();
  const type = (c.req.query("type") || "card") as "card" | "set";
  const result = await validateAgainstSchema(c.env, body, type);
  return c.json(result);
});

app.get("/api/download/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const obj = await c.env.DATA_BUCKET.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);

  c.header("Content-Type", obj.httpMetadata?.contentType || "application/json");
  c.header("Content-Disposition", `attachment; filename="${key.split("/").pop()}"`);
  return c.body(obj.body);
});

app.get("*", async (c) => {
  const url = new URL(c.req.url);
  const assetUrl = new URL("/index.html", url.origin);
  const asset = await c.env.ASSETS.fetch(new Request(assetUrl, c.req.raw));
  return asset || c.text("Not found", 404);
});

async function validateAgainstSchema(env: Bindings, data: unknown, type: "card" | "set") {
  const schemaVersion = type === "card" ? "0.1" : "0.2";
  const cacheKey = `schema:${type}:v${schemaVersion}`;
  let schemaJson = await env.SCHEMA_CACHE.get(cacheKey);

  if (!schemaJson) {
    const schemaKey = type === "card" ? "schema/cards.json" : "schema/set.json";
    const obj = await env.DATA_BUCKET.get(schemaKey);
    if (!obj) return { valid: false, errors: [{ message: "Schema not found in storage" }] };
    schemaJson = await obj.text();
    await env.SCHEMA_CACHE.put(cacheKey, schemaJson, { expirationTtl: 86400 });
  }

  const ajv = new Ajv({ strict: false });
  const validate = ajv.compile(JSON.parse(schemaJson));
  const valid = validate(data);
  return { valid, errors: validate.errors || [], schema_version: schemaVersion };
}

type DbRow = Record<string, unknown>;

function hydrateSet(row: DbRow) {
  return {
    ...row,
    category: safeJsonParse(asNullableString(row.category), []),
    sports: safeJsonParse(asNullableString(row.sports), null),
    years: safeJsonParse(asNullableString(row.years), null),
    metadata: safeJsonParse(asNullableString(row.metadata), null),
    parallel: !!row.parallel,
    insert: !!row.insert_set,
    autograph: !!row.autograph,
    relic: !!row.relic,
  };
}

function hydrateCard(row: DbRow) {
  return {
    ...row,
    subjects: safeJsonParse(asNullableString(row.subjects), []),
    sports: safeJsonParse(asNullableString(row.sports), null),
    external_links: safeJsonParse(asNullableString(row.external_links), null),
    metadata: safeJsonParse(asNullableString(row.metadata), null),
    serial_numbered: !!row.serial_numbered,
    autograph: !!row.autograph,
    relic: !!row.relic,
    rookie_card: !!row.rookie_card,
  };
}

function safeJsonParse(str: string | null, fallback: unknown) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default app;
