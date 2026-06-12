#!/usr/bin/env node
import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import YAML from "yaml";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const [key, inlineValue] = arg.slice(2).split("=", 2);
  if (inlineValue !== undefined) {
    args.set(key, inlineValue);
  } else if (process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    args.set(key, process.argv[i + 1]);
    i += 1;
  } else {
    args.set(key, "true");
  }
}

const dataDir = args.get("data") || "data";
const outFile = args.get("out") || ".wrangler/open-checklist-seed.sql";
const command = args.get("command") || "summary";

async function main() {
  const records = await loadRecords(dataDir);

  if (command === "summary") {
    printSummary(records);
    return;
  }

  if (command === "validate") {
    validateRecords(records);
    printSummary(records);
    console.log("Validation passed.");
    return;
  }

  if (command === "write-sql") {
    validateRecords(records);
    const sql = buildSql(records);
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, sql, "utf8");
    printSummary(records);
    console.log(`Wrote ${outFile}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function loadRecords(root) {
  const setFiles = await findFiles(root, "set.yaml");
  const sets = [];
  const cards = [];

  for (const setFile of setFiles.sort()) {
    const set = await readYaml(setFile);
    set.__file = setFile;
    sets.push(set);

    const cardsDir = join(dirname(setFile), "cards");
    const cardFiles = (await pathExists(cardsDir)) ? await findFiles(cardsDir, ".yaml") : [];
    for (const cardFile of cardFiles.sort()) {
      const card = await readYaml(cardFile);
      card.__file = cardFile;
      cards.push(card);
    }
  }

  return { sets, cards };
}

async function readYaml(file) {
  const text = await readFile(file, "utf8");
  return YAML.parse(text);
}

async function findFiles(root, match) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(path, match)));
    } else if (match.startsWith(".") ? entry.name.endsWith(match) : entry.name === match) {
      files.push(path);
    }
  }
  return files;
}

async function pathExists(path) {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

function validateRecords(records) {
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
  const validateSet = ajv.compile(loadJson("schema/set.json"));
  const validateCard = ajv.compile(loadJson("schema/cards.json"));
  const errors = [];

  for (const set of records.sets) {
    const clean = withoutInternalFields(set);
    if (!validateSet(clean)) {
      errors.push(formatValidationError(set.__file, validateSet.errors));
    }
  }

  const setIds = new Set(records.sets.map((set) => set.set_id));
  for (const card of records.cards) {
    const clean = withoutInternalFields(card);
    if (!validateCard(clean)) {
      errors.push(formatValidationError(card.__file, validateCard.errors));
    }
    if (!setIds.has(card.set_id)) {
      errors.push(`${card.__file}: card references missing set_id ${card.set_id}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.slice(0, 50).join("\n")}${errors.length > 50 ? `\n...${errors.length - 50} more` : ""}`);
  }
}

function loadJson(path) {
  return JSON.parse(readFileSyncUtf8(path));
}

function readFileSyncUtf8(path) {
  return readFileSync(path, "utf8");
}

function withoutInternalFields(record) {
  const clean = { ...record };
  delete clean.__file;
  return clean;
}

function formatValidationError(file, errors = []) {
  return `${file}: ${errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ")}`;
}

function printSummary({ sets, cards }) {
  const counts = new Map();
  for (const card of cards) counts.set(card.set_id, (counts.get(card.set_id) || 0) + 1);

  console.log(`Sets: ${sets.length}`);
  console.log(`Cards: ${cards.length}`);
  for (const set of sets.sort((a, b) => a.set_id.localeCompare(b.set_id))) {
    console.log(`- ${set.set_id}: ${counts.get(set.set_id) || 0} cards`);
  }
}

function buildSql({ sets, cards }) {
  const setIds = sets.map((set) => set.set_id).sort();
  const lines = [
    `DELETE FROM cards WHERE set_id IN (${setIds.map(sqlString).join(", ")});`,
    `DELETE FROM sets WHERE set_id IN (${setIds.map(sqlString).join(", ")});`,
  ];

  for (const set of sets.sort((a, b) => a.set_id.localeCompare(b.set_id))) {
    lines.push(
      insertSql("sets", [
        "uuid",
        "set_id",
        "name",
        "genre",
        "category",
        "sports",
        "season",
        "years",
        "parallel",
        "insert_set",
        "autograph",
        "relic",
        "base_set",
        "series",
        "series_number",
        "release_date",
        "manufacturer",
        "card_count",
        "print_run",
        "subset",
        "description",
        "image_url",
        "metadata",
      ], [
        set.uuid,
        set.set_id,
        set.name,
        set.genre,
        jsonValue(set.category || []),
        jsonValue(set.sports ?? null),
        set.season ?? null,
        jsonValue(set.years ?? null),
        boolValue(set.parallel),
        boolValue(set.insert),
        boolValue(set.autograph),
        boolValue(set.relic),
        set.base_set ?? null,
        set.series ?? null,
        set.series_number ?? null,
        set.release_date ?? null,
        set.manufacturer ?? null,
        set.card_count ?? null,
        set.print_run ?? null,
        set.subset ?? null,
        set.description ?? null,
        set.image_url ?? null,
        jsonValue(set.metadata ?? null),
      ]),
    );
  }

  for (const card of cards.sort(compareCards)) {
    lines.push(
      insertSql("cards", [
        "uuid",
        "number",
        "genre",
        "sport",
        "sports",
        "set_id",
        "subjects",
        "card_name",
        "description",
        "series",
        "set_number",
        "subset",
        "variation",
        "parallel",
        "print_run",
        "serial_numbered",
        "autograph",
        "relic",
        "rookie_card",
        "release_date",
        "image_url",
        "external_links",
        "metadata",
      ], [
        card.uuid,
        card.number,
        card.genre,
        card.sport ?? null,
        jsonValue(card.sports ?? null),
        card.set_id,
        jsonValue(card.subjects || []),
        card.card_name ?? null,
        card.description ?? null,
        card.series ?? null,
        card.set_number ?? null,
        card.subset ?? null,
        card.variation ?? null,
        card.parallel ?? null,
        card.print_run ?? null,
        boolValue(card.serial_numbered),
        boolValue(card.autograph),
        boolValue(card.relic),
        boolValue(card.rookie_card),
        card.release_date ?? null,
        card.image_url ?? null,
        jsonValue(card.external_links ?? null),
        jsonValue(card.metadata ?? null),
      ]),
    );
  }

  lines.push("");
  return lines.join("\n");
}

function compareCards(a, b) {
  return a.set_id.localeCompare(b.set_id) || String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
}

function insertSql(table, columns, values) {
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.map(sqlValue).join(", ")});`;
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return sqlString(value);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonValue(value) {
  return value === null || value === undefined ? null : JSON.stringify(value);
}

function boolValue(value) {
  return value ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
