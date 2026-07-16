// ============================================================================
// EHT_API — GraphQL client for the EHTravel supergraph (Apollo Router → Duffel).
//
// Every method tries the live federated GraphQL endpoint first and gracefully falls
// back to deterministic client-side mock data when the router/token is unavailable —
// so the UI is always demonstrable, and goes live the moment DUFFEL_API_TOKEN + the
// router are up. The browser NEVER sees the Duffel token; it only talks to the router.
// ============================================================================

const EHT_ENDPOINT =
  (typeof window !== "undefined" && window.GRAPHQL_ENDPOINT) ||
  (typeof document !== "undefined" &&
    document.querySelector('meta[name="graphql-endpoint"]')?.content) ||
  "http://localhost:4000/graphql";

const EHT_ASSISTANT_UPLOAD_ENDPOINT =
  (typeof window !== "undefined" && window.ASSISTANT_UPLOAD_ENDPOINT) ||
  (typeof document !== "undefined" &&
    document.querySelector('meta[name="assistant-upload-endpoint"]')?.content) ||
  "http://localhost:4100/v1/uploads";

function assistantSessionId() {
  const key = "ehtravel-assistant-session";
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

const EHT_ASSISTANT_SESSION_ID = assistantSessionId();

async function authHeaders() {
  // The host authentication layer may provide a short-lived token callback. Tokens are never
  // persisted by this client or placed in localStorage.
  const provided = typeof window?.EHT_GET_AUTH_TOKEN === "function"
    ? await window.EHT_GET_AUTH_TOKEN()
    : window?.EHT_AUTH_TOKEN;
  return {
    ...(provided ? { Authorization: `Bearer ${provided}` } : {}),
    "X-EHTravel-Session-ID": EHT_ASSISTANT_SESSION_ID,
  };
}

// ---- low-level fetch --------------------------------------------------------
async function gqlFetch(query, variables, { timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(EHT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ query, variables }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join("; "));
    return json.data;
  } finally {
    clearTimeout(t);
  }
}

// ---- helpers ----------------------------------------------------------------
function parseISODurationToMin(iso) {
  if (!iso) return null;
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m) return null;
  return (+(m[1] || 0)) * 1440 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}
function timeOfDayMin(isoDateTime) {
  if (!isoDateTime) return 0;
  const m = /T(\d{2}):(\d{2})/.exec(isoDateTime);
  if (!m) return 0;
  return (+m[1]) * 60 + (+m[2]);
}
function futureISODate(daysAhead) {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().slice(0, 10);
}
const _ACCENTS = ["#0b1a2b", "#2f5d3a", "#b54a1d", "#3a5a8c", "#6a4d8a"];
function accentFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return _ACCENTS[h % _ACCENTS.length];
}

// ---- operation documents (mirror graphql/operations/*.graphql) --------------
const OP_SEARCH_FLIGHTS = `query SearchFlights($input: FlightSearchInput!) {
  searchFlights(input: $input) {
    id totalAmount totalCurrency
    owner { name iataCode logoUrl }
    slices { duration origin { iataCode cityName } destination { iataCode cityName }
      segments { departingAt arrivingAt duration operatingCarrier { name iataCode } aircraft { name } origin { iataCode } destination { iataCode } } }
  }
}`;
const OP_SEARCH_STAYS = `query SearchStays($input: StaySearchInput!) {
  searchStays(input: $input) {
    id cheapestRateTotalAmount cheapestRateCurrency
    accommodation { id name rating reviewScore photos { url } location { address { lineOne city countryCode postalCode } } }
  }
}`;
const OP_SEARCH_CARS = `query SearchCars($input: CarSearchInput!) {
  searchCars(input: $input) {
    id vendor vehicleClass vehicleName transmission seats bags imageUrl totalAmount currency pickupLocation dropoffLocation
  }
}`;
const OP_SEND_TRAVEL_ASSISTANT_MESSAGE = `mutation SendTravelAssistantMessage($input: TravelAssistantInput!) {
  sendTravelAssistantMessage(input: $input) {
    conversationId message
    orders { id bookingReference status totalAmount totalCurrency createdAt
      slices { origin { iataCode cityName } destination { iataCode cityName } departingAt arrivingAt duration } }
    attachments { id name mimeType kind size expiresAt }
  }
}`;
const OP_MY_FLIGHT_ORDERS = `query MyFlightOrders($bookingReference: String) {
  myFlightOrders(bookingReference: $bookingReference) {
    id bookingReference status totalAmount totalCurrency createdAt
    slices { origin { iataCode cityName } destination { iataCode cityName } departingAt arrivingAt duration }
  }
}`;

// ---- mappers: Duffel GraphQL shape → existing UI flight shape ---------------
function offerToFlight(o) {
  const slice = o.slices?.[0] || {};
  const segs = slice.segments || [];
  const first = segs[0] || {};
  const last = segs[segs.length - 1] || first;
  const carrierName = first.operatingCarrier?.name || o.owner?.name || "Carrier";
  return {
    id: o.id,
    carrier: { code: first.operatingCarrier?.iataCode || o.owner?.iataCode || "—", name: carrierName, accent: accentFor(carrierName) },
    origin: slice.origin?.iataCode || first.origin?.iataCode || "",
    dest: slice.destination?.iataCode || last.destination?.iataCode || "",
    depMin: timeOfDayMin(first.departingAt),
    arrMin: timeOfDayMin(last.arrivingAt),
    durationMin: parseISODurationToMin(slice.duration) || 0,
    stops: Math.max(0, segs.length - 1),
    price: Math.round(parseFloat(o.totalAmount || "0")),
    aircraft: first.aircraft?.name || "—",
    cabin: "Economy",
    co2: Math.round(180 + (parseISODurationToMin(slice.duration) || 300) / 3),
    _live: true,
  };
}

// ---- geo lookup for hotel city → coordinates (Duffel Stays needs lat/long) --
const CITY_COORDS = {
  TYO: { lat: 35.6762, lng: 139.6503 }, HND: { lat: 35.5494, lng: 139.7798 }, NRT: { lat: 35.7719, lng: 140.3929 },
  LIS: { lat: 38.7223, lng: -9.1393 }, REK: { lat: 64.1466, lng: -21.9426 }, KEF: { lat: 63.985, lng: -22.6056 },
  MEX: { lat: 19.4326, lng: -99.1332 }, MRK: { lat: 31.6295, lng: -7.9811 }, RAK: { lat: 31.6295, lng: -7.9811 },
  SIN: { lat: 1.3521, lng: 103.8198 }, JFK: { lat: 40.6413, lng: -73.7781 }, LAX: { lat: 33.9416, lng: -118.4085 },
  SFO: { lat: 37.6213, lng: -122.379 }, ORD: { lat: 41.9742, lng: -87.9073 }, LHR: { lat: 51.47, lng: -0.4543 },
  CDG: { lat: 49.0097, lng: 2.5479 }, AMS: { lat: 52.3105, lng: 4.7683 }, FCO: { lat: 41.8003, lng: 12.2389 },
  BCN: { lat: 41.2974, lng: 2.0833 }, DXB: { lat: 25.2532, lng: 55.3657 }, SYD: { lat: -33.8688, lng: 151.2093 },
  GRU: { lat: -23.5505, lng: -46.6333 }, IST: { lat: 41.2753, lng: 28.7519 },
};
function coordsFor(code) { return CITY_COORDS[code] || { lat: 51.5071, lng: -0.1416 }; }

// ---- mock generators (offline / no-token demo) ------------------------------
function mockStays(cityLabel = "your destination") {
  const rnd = window.randSeed("stay-" + cityLabel);
  const names = ["The Meridian House", "Halcyon Grand", "Solbird Suites", "Northvane Loft Hotel", "Aeria Garden Inn", "Cobalt & Cream"];
  return names.map((name, i) => ({
    id: "mock_stay_" + i,
    cheapestRateTotalAmount: String(Math.round(120 + rnd() * 480)),
    cheapestRateCurrency: "USD",
    accommodation: {
      id: "acc_" + i, name, rating: 3 + Math.floor(rnd() * 3),
      reviewScore: +(7 + rnd() * 3).toFixed(1),
      photos: [{ url: `https://picsum.photos/seed/${encodeURIComponent(name)}/800/600` }],
      location: { address: { lineOne: `${10 + i} Harbour Way`, city: cityLabel, countryCode: "—", postalCode: "" } },
    },
    _mock: true,
  }));
}
function mockCars(pickup = "Downtown") {
  const rnd = window.randSeed("car-" + pickup);
  const cars = [
    { cls: "Economy", name: "Solbird Micro", seats: 4, bags: 1, tx: "Automatic" },
    { cls: "Compact", name: "Northvane C40", seats: 5, bags: 2, tx: "Automatic" },
    { cls: "SUV", name: "Meridian Trail", seats: 5, bags: 3, tx: "Automatic" },
    { cls: "Premium", name: "Halcyon Lux", seats: 5, bags: 3, tx: "Automatic" },
    { cls: "Van", name: "Aeria People Mover", seats: 7, bags: 5, tx: "Manual" },
  ];
  return cars.map((c, i) => ({
    id: "mock_car_" + i, vendor: ["Aeria Rentals", "Northvane Wheels", "Solbird Drive"][i % 3],
    vehicleClass: c.cls, vehicleName: c.name, transmission: c.tx, seats: c.seats, bags: c.bags,
    imageUrl: `https://picsum.photos/seed/car-${i}/600/400`,
    totalAmount: String(Math.round(38 + rnd() * 160)), currency: "USD",
    pickupLocation: pickup, dropoffLocation: pickup, _mock: true,
  }));
}

// ---- public API -------------------------------------------------------------
const EHT_API = {
  endpoint: EHT_ENDPOINT,

  // Accepts the app's `query` object; returns objects in the existing flight shape.
  async searchFlights(query) {
    const origin = query?.origin?.code, destination = query?.dest?.code;
    const roundTrip = query?.tripType === "Round trip";
    const slices = [{ origin, destination, departureDate: futureISODate(30) }];
    if (roundTrip) slices.push({ origin: destination, destination: origin, departureDate: futureISODate(44) });
    const input = { slices, passengers: [{ type: "adult" }], cabinClass: "economy" };
    try {
      const data = await gqlFetch(OP_SEARCH_FLIGHTS, { input });
      const offers = data?.searchFlights || [];
      if (offers.length) return offers.map(offerToFlight).sort((a, b) => a.price - b.price);
      throw new Error("no offers");
    } catch (e) {
      // graceful fallback to the deterministic prototype generator
      return window.makeFlights(origin, destination, query?.departLabel || "");
    }
  },

  async searchStays({ cityCode, cityLabel, checkInDate, checkOutDate, rooms = 1, adults = 2, radius = 8 } = {}) {
    const { lat, lng } = coordsFor(cityCode);
    const input = {
      checkInDate: checkInDate || futureISODate(30),
      checkOutDate: checkOutDate || futureISODate(33),
      rooms, guests: Array.from({ length: adults }, () => ({ type: "adult" })),
      location: { latitude: lat, longitude: lng, radius },
    };
    try {
      const data = await gqlFetch(OP_SEARCH_STAYS, { input });
      const results = data?.searchStays || [];
      if (results.length) return results;
      throw new Error("no stays");
    } catch (e) {
      return mockStays(cityLabel || cityCode || "your destination");
    }
  },

  async searchCars({ pickupLocation, dropoffLocation, pickupDate, dropoffDate, driverAge = 30 } = {}) {
    const input = {
      pickupLocation, dropoffLocation: dropoffLocation || pickupLocation,
      pickupDate: pickupDate || futureISODate(30) + "T10:00", dropoffDate: dropoffDate || futureISODate(33) + "T10:00",
      driverAge,
    };
    try {
      const data = await gqlFetch(OP_SEARCH_CARS, { input });
      const results = data?.searchCars || [];
      if (results.length) return results;
      throw new Error("no cars");
    } catch (e) {
      // Cars are a MOCK subgraph (Duffel has no cars API) — always fall back client-side.
      return mockCars(pickupLocation || "Downtown");
    }
  },

  async uploadAssistantAttachments(files, { signal } = {}) {
    const form = new FormData();
    for (const file of files) form.append("files", file, file.name);
    const res = await fetch(EHT_ASSISTANT_UPLOAD_ENDPOINT, {
      method: "POST",
      headers: await authHeaders(),
      body: form,
      signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || `Attachment upload failed (${res.status})`);
    return json.attachments || [];
  },

  async sendAssistantMessage(input) {
    const data = await gqlFetch(OP_SEND_TRAVEL_ASSISTANT_MESSAGE, { input }, { timeoutMs: 75000 });
    return data?.sendTravelAssistantMessage;
  },

  async myFlightOrders(bookingReference) {
    const data = await gqlFetch(OP_MY_FLIGHT_ORDERS, { bookingReference: bookingReference || null });
    return data?.myFlightOrders || [];
  },

  assistant: { uploadEndpoint: EHT_ASSISTANT_UPLOAD_ENDPOINT, sessionId: EHT_ASSISTANT_SESSION_ID },
};

window.EHT_API = EHT_API;
