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
const r = spawnSync(rover, ["supergraph", "compose", "--config", "graphql/supergraph.yaml"], {
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
  for (const field of ["searchFlights", "searchStays", "searchCars", "flightOffer", "myFlightOrders", "sendTravelAssistantMessage"]) {
    sdl.includes(field) ? ok(`exposes ${field}`) : bad(`missing root field ${field}`);
  }
  for (const field of ["createFlightOrder", "createStayBooking"]) {
    !sdl.includes(`${field}(`) ? ok(`does not expose unsafe ${field}`) : bad(`still exposes unsafe root field ${field}`);
  }
}

console.log("Front-end wiring:");
const html = existsSync(join(root, "index.html")) ? readFileSync(join(root, "index.html"), "utf8") : "";
for (const s of ["src/api.jsx", "src/search-shared.jsx", "src/screen-search-hotels.jsx", "src/screen-search-cars.jsx", "src/floating-chat.jsx", "src/floating-chat.css"]) {
  html.includes(s) ? ok(`index.html loads ${s}`) : bad(`index.html does not load ${s}`);
}
const api = existsSync(join(root, "src/api.jsx")) ? readFileSync(join(root, "src/api.jsx"), "utf8") : "";
["searchFlights", "searchStays", "searchCars", "uploadAssistantAttachments", "sendAssistantMessage", "myFlightOrders"].every(m => api.includes(m))
  ? ok("EHT_API exposes search and assistant methods") : bad("EHT_API missing a search or assistant method");

const assistantUi = readFileSync(join(root, "src/floating-chat.jsx"), "utf8");
for (const behavior of ["getUserMedia", "MediaRecorder", "track.stop()", "URL.revokeObjectURL", "aria-live"]) {
  assistantUi.includes(behavior) ? ok(`assistant implements ${behavior}`) : bad(`assistant missing ${behavior}`);
}
api.includes("FormData") ? ok("assistant uploads use multipart FormData") : bad("assistant upload is not multipart");

const duffelSchema = readFileSync(join(root, "graphql/duffel.graphql"), "utf8");
!duffelSchema.includes("createFlightOrder(input:") ? ok("public flight-order write is removed") : bad("public flight-order write remains");
const routerConfig = readFileSync(join(root, "graphql/router.yaml"), "utf8");
!routerConfig.includes("allow_any_origin: true") && !routerConfig.includes("- \"*\"")
  ? ok("router uses explicit CORS origins") : bad("router has wildcard CORS");

console.log(fail ? `\nTESTS FAILED (${fail})` : "\nTESTS OK");
process.exit(fail ? 1 : 0);
