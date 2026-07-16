// EHTravel lint — dependency-light static checks (JSX parse + JSON/YAML sanity + GraphQL presence).
// Usage: node scripts/lint.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
let errors = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); errors++; };

// 1) JSX parse check via esbuild (matches the in-browser Babel transform surface)
console.log("JSX syntax:");
const jsx = readdirSync(join(root, "src")).filter(f => f.endsWith(".jsx"));
for (const f of jsx) {
  const p = join(root, "src", f);
  const r = spawnSync("npx", ["--yes", "esbuild", "--loader=jsx"], { input: readFileSync(p), encoding: "utf8" });
  if (r.status === 0) ok(`src/${f}`);
  else bad(`src/${f}\n${(r.stderr || "").split("\n").slice(0, 6).join("\n")}`);
}

// 2) JSON parse check
console.log("JSON:");
for (const f of ["package.json", "ui-tokens.json", ".mcp.json", "skills-lock.json"]) {
  if (!existsSync(join(root, f))) { continue; }
  try { JSON.parse(readFileSync(join(root, f), "utf8")); ok(f); }
  catch (e) { bad(`${f}: ${e.message}`); }
}

// 3) Required GraphQL artifacts present
console.log("GraphQL layer:");
for (const f of ["graphql/duffel.graphql", "graphql/cars.graphql", "graphql/supergraph.yaml", "graphql/router.yaml",
                 "graphql/assistant.graphql",
                 "graphql/operations/searchFlights.graphql", "graphql/operations/searchStays.graphql",
                 "graphql/operations/searchCars.graphql", "graphql/operations/myFlightOrders.graphql",
                 "graphql/operations/sendTravelAssistantMessage.graphql"]) {
  existsSync(join(root, f)) ? ok(f) : bad(`missing ${f}`);
}

// 4) Server-side JavaScript syntax
console.log("Assistant middleware syntax:");
for (const f of readdirSync(join(root, "services/assistant")).filter((name) => name.endsWith(".mjs"))) {
  const r = spawnSync(process.execPath, ["--check", join(root, "services/assistant", f)], { encoding: "utf8" });
  r.status === 0 ? ok(`services/assistant/${f}`) : bad(`services/assistant/${f}\n${r.stderr}`);
}

// 5) No hardcoded provider token in tracked files (secret hygiene)
console.log("Secret hygiene:");
const scan = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(d => {
  if (d.name === "node_modules" || d.name === ".git" || d.name === ".env" || (/^\.env\./.test(d.name) && d.name !== ".env.example")) return [];
  const p = join(dir, d.name);
  if (d.isDirectory()) return scan(p);
  if (/\.(jsx?|mjs|graphql|ya?ml|json|html|md)$/.test(d.name)) return [p];
  return [];
});
let leaked = 0;
for (const p of scan(root)) {
  const t = readFileSync(p, "utf8");
  if (/duffel_(test|live)_[A-Za-z0-9]{10,}/.test(t)) { bad(`possible Duffel token in ${p.replace(root + "/", "")}`); leaked++; }
  if (/\bsk-[A-Za-z0-9_-]{20,}\b/.test(t)) { bad(`possible model API key in ${p.replace(root + "/", "")}`); leaked++; }
}
if (!leaked) ok("no provider tokens committed");

console.log(errors ? `\nLINT FAILED (${errors})` : "\nLINT OK");
process.exit(errors ? 1 : 0);
