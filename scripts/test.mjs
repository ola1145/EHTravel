// EHTravel test — validates the federated supergraph composes and exposes the expected fields.
// Usage: node scripts/test.mjs
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";

const root = process.cwd();
let fail = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { console.log(`  ✗ ${m}`); fail++; };

// Locate rover (installed to ~/.rover/bin by scripts/install-mcp.sh, or on PATH)
const roverLocal = join(homedir(), ".rover", "bin", "rover");
const rover = existsSync(roverLocal) ? roverLocal : "rover";

console.log("Supergraph composition:");
const r = spawnSync(rover, ["supergraph", "compose", "--config", "graphql/supergraph.yaml", "--elv2-license", "accept"], {
  cwd: root, encoding: "utf8",
  env: { ...process.env, APOLLO_ELV2_LICENSE: "accept", APOLLO_TELEMETRY_DISABLED: "1" },
});

if (r.error && r.error.code === "ENOENT") {
  console.log("  ! rover not found — skipping composition (run: bash scripts/install-mcp.sh)");
} else if (r.status !== 0) {
  bad("rover supergraph compose failed:\n" + (r.stderr || "").split("\n").slice(0, 12).join("\n"));
} else {
  ok("supergraph composes");
  const sdl = r.stdout;
  for (const field of ["searchFlights", "searchStays", "searchCars", "createFlightOrder", "createStayBooking", "flightOffer"]) {
    sdl.includes(field) ? ok(`exposes ${field}`) : bad(`missing root field ${field}`);
  }
}

console.log("Front-end wiring:");
const html = existsSync(join(root, "index.html")) ? readFileSync(join(root, "index.html"), "utf8") : "";
for (const s of ["src/api.jsx", "src/search-shared.jsx", "src/screen-search-hotels.jsx", "src/screen-search-cars.jsx"]) {
  html.includes(s) ? ok(`index.html loads ${s}`) : bad(`index.html does not load ${s}`);
}
const api = existsSync(join(root, "src/api.jsx")) ? readFileSync(join(root, "src/api.jsx"), "utf8") : "";
["searchFlights", "searchStays", "searchCars"].every(m => api.includes(m))
  ? ok("EHT_API exposes search methods") : bad("EHT_API missing a search method");

console.log(fail ? `\nTESTS FAILED (${fail})` : "\nTESTS OK");
process.exit(fail ? 1 : 0);
