/**
 * Generate a full locale dictionary pack via backend Google Translation.
 *
 * Usage (from front_end repo, with backend running + credentials configured):
 *   node scripts/generate-locale-pack.mjs hi --token <JWT>
 *
 * Without credentials the script exits with instructions — it does not invent
 * translations or claim Hindi is complete.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = (process.argv[2] || "hi").toLowerCase();
const tokenArgIdx = process.argv.indexOf("--token");
const token = tokenArgIdx >= 0 ? process.argv[tokenArgIdx + 1] : process.env.ISO_JWT;
const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://127.0.0.1:5900/api/v1";

const SUPPORTED = new Set(["es", "ar", "fr", "it", "hi"]);
if (!SUPPORTED.has(target)) {
  console.error(`Target must be one of: ${[...SUPPORTED].join(", ")}`);
  process.exit(1);
}

if (!token) {
  console.error(
    "JWT required (--token or ISO_JWT). Translation endpoints are authenticated.",
  );
  process.exit(1);
}

const clientPath = path.join(__dirname, "../lib/i18n/client.ts");
const src = fs.readFileSync(clientPath, "utf8");
const start = src.indexOf("export const commonEN =");
const end = src.indexOf("export const commonFR");
if (start < 0 || end < 0) {
  console.error("Could not locate commonEN in client.ts");
  process.exit(1);
}

// Evaluate EN object (trusted local source)
const enLiteral = src.slice(start + "export const commonEN =".length, end).trim();
const commonEN = eval(`(${enLiteral.replace(/;\s*$/, "")})`);

function flatten(obj, prefix = "", out = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else if (typeof v === "string") out.push({ key, text: v });
  }
  return out;
}

function unflatten(entries) {
  const root = {};
  for (const { key, text } of entries) {
    const parts = key.split(".");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] || {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = text;
  }
  return root;
}

const entries = flatten(commonEN);
console.log(`Flattened ${entries.length} strings. Translating to ${target}…`);

const batchSize = 40;
const translated = [];
for (let i = 0; i < entries.length; i += batchSize) {
  const chunk = entries.slice(i, i + batchSize);
  const res = await fetch(`${apiBase}/translation/translate/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: chunk.map((e) => ({
        text: e.text,
        targetLocale: target,
        sourceLocale: "en",
        contentType: "ui_dictionary",
        field: e.key,
      })),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Batch failed at offset ${i}: HTTP ${res.status}`, body);
    process.exit(1);
  }
  const json = await res.json();
  const results = json?.data?.results || [];
  if (!json?.data?.liveEnabled) {
    console.error(
      "Google Translation is not live-enabled on the backend. Configure credentials first.",
    );
    process.exit(2);
  }
  for (let j = 0; j < chunk.length; j++) {
    translated.push({
      key: chunk[j].key,
      text: results[j]?.translated ? results[j].text : chunk[j].text,
    });
  }
  console.log(`Progress ${Math.min(i + batchSize, entries.length)}/${entries.length}`);
}

const pack = unflatten(translated);
const outPath = path.join(__dirname, `../lib/i18n/generated/${target}.json`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(pack, null, 2), "utf8");
console.log(`Wrote ${outPath}`);
console.log(
  "Next: review the pack, then wire it into client.ts resources as commonHI/commonXX.",
);
