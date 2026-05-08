// ----- Static data for the prototype -----
const DESTINATIONS = [
  { code: "TYO", city: "Tokyo",      country: "Japan",      tag: "Neon dusk",        img: "https://picsum.photos/seed/tokyo-aeria/1200/1500", price: 612, hue: "rgba(220,80,90,.55)" },
  { code: "LIS", city: "Lisbon",     country: "Portugal",   tag: "Atlantic gold",    img: "https://picsum.photos/seed/lisbon-aeria/1200/1500", price: 348, hue: "rgba(220,140,60,.5)" },
  { code: "REK", city: "Reykjavík",  country: "Iceland",    tag: "Aurora season",    img: "https://picsum.photos/seed/iceland-aeria/1200/1500", price: 489, hue: "rgba(60,120,160,.55)" },
  { code: "MEX", city: "Mexico City",country: "Mexico",     tag: "Volcano valley",   img: "https://picsum.photos/seed/mexico-aeria/1200/1500", price: 274, hue: "rgba(180,80,40,.55)" },
  { code: "MRK", city: "Marrakech",  country: "Morocco",    tag: "Souk hours",       img: "https://picsum.photos/seed/marrakech-aeria/1200/1500", price: 412, hue: "rgba(190,90,50,.55)" },
  { code: "SIN", city: "Singapore",  country: "Singapore",  tag: "Equatorial nights",img: "https://picsum.photos/seed/singapore-aeria/1200/1500", price: 728, hue: "rgba(70,140,140,.55)" },
];

const AIRPORTS = [
  { code: "JFK", city: "New York",     name: "John F. Kennedy Intl." },
  { code: "LAX", city: "Los Angeles",  name: "Los Angeles Intl." },
  { code: "SFO", city: "San Francisco",name: "San Francisco Intl." },
  { code: "ORD", city: "Chicago",      name: "O'Hare Intl." },
  { code: "LHR", city: "London",       name: "Heathrow" },
  { code: "CDG", city: "Paris",        name: "Charles de Gaulle" },
  { code: "AMS", city: "Amsterdam",    name: "Schiphol" },
  { code: "FCO", city: "Rome",         name: "Fiumicino" },
  { code: "BCN", city: "Barcelona",    name: "El Prat" },
  { code: "DXB", city: "Dubai",        name: "Dubai Intl." },
  { code: "HND", city: "Tokyo",        name: "Haneda" },
  { code: "NRT", city: "Tokyo",        name: "Narita" },
  { code: "SIN", city: "Singapore",    name: "Changi" },
  { code: "SYD", city: "Sydney",       name: "Kingsford Smith" },
  { code: "GRU", city: "São Paulo",    name: "Guarulhos" },
  { code: "MEX", city: "Mexico City",  name: "Benito Juárez" },
  { code: "LIS", city: "Lisbon",       name: "Humberto Delgado" },
  { code: "KEF", city: "Reykjavík",    name: "Keflavík" },
  { code: "RAK", city: "Marrakech",    name: "Menara" },
  { code: "IST", city: "Istanbul",     name: "Istanbul Airport" },
];

// fictional carriers — original names so we don't clone any real brand
const CARRIERS = [
  { code: "AE", name: "Aeria",        accent: "#0b1a2b" },
  { code: "NV", name: "Northvane",    accent: "#2f5d3a" },
  { code: "SB", name: "Solbird",      accent: "#b54a1d" },
  { code: "MR", name: "Meridian Air", accent: "#3a5a8c" },
  { code: "HL", name: "Halcyon",      accent: "#6a4d8a" },
];

function randSeed(s) {
  // tiny deterministic PRNG so results are stable
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
}

function makeFlights(originCode, destCode, dateISO) {
  const rnd = randSeed(originCode + destCode + dateISO);
  const baseHour = 6;
  const flights = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const carrier = CARRIERS[Math.floor(rnd() * CARRIERS.length)];
    const depMin = (baseHour + i * 2) * 60 + Math.floor(rnd() * 50);
    const durationMin = 360 + Math.floor(rnd() * 540); // 6h–15h
    const arrMin = depMin + durationMin;
    const stops = rnd() < .55 ? 0 : (rnd() < .8 ? 1 : 2);
    const price = Math.round(280 + rnd() * 920 + (stops === 0 ? 60 : 0));
    const aircraft = ["A320neo","A350-900","A321XLR","B787-9","B777-300ER","E195-E2"][Math.floor(rnd() * 6)];
    flights.push({
      id: `${carrier.code}${100 + Math.floor(rnd() * 900)}`,
      carrier,
      origin: originCode,
      dest: destCode,
      depMin: depMin % (24 * 60),
      arrMin: arrMin % (24 * 60),
      durationMin,
      stops,
      price,
      aircraft,
      cabin: rnd() < .5 ? "Window" : "Aisle",
      co2: Math.round(180 + rnd() * 250),
    });
  }
  return flights;
}

function fmtTime(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function fmtDuration(min) {
  return `${Math.floor(min/60)}h ${min%60}m`;
}
function fmtMoney(n) { return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }

Object.assign(window, {
  DESTINATIONS, AIRPORTS, CARRIERS,
  makeFlights, fmtTime, fmtDuration, fmtMoney, randSeed
});
