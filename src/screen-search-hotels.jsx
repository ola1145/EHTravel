// Hotels (Duffel Stays) search panel — additive. Renders inside the existing glass search
// panel when mode === "hotels". Self-contained: search → results → booking overlay, so the
// flight state machine in app.jsx is never touched. Accent: --sky.

const HotelSearchPanel = () => {
  const [city, setCity] = useState(DESTINATIONS[0]);
  const [cityOpen, setCityOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // null | [] | [stay]
  const [booking, setBooking] = useState(null);  // selected stay for booking overlay

  const cityChoices = useMemo(() => {
    // merge featured destinations + airport cities into one pickable list
    const seen = new Set();
    const out = [];
    for (const d of DESTINATIONS) { if (!seen.has(d.code)) { seen.add(d.code); out.push({ code: d.code, city: d.city, country: d.country }); } }
    for (const a of AIRPORTS) { if (!seen.has(a.code)) { seen.add(a.code); out.push({ code: a.code, city: a.city, country: a.name }); } }
    return out;
  }, []);

  async function runSearch() {
    setLoading(true); setResults(null);
    const list = await EHT_API.searchStays({
      cityCode: city.code, cityLabel: city.city,
      checkInDate: checkIn || undefined, checkOutDate: checkOut || undefined,
      rooms, adults,
    });
    setLoading(false); setResults(list);
  }

  return (
    <div>
      {/* Field row — mirrors the flight field grid, sky accent */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr .9fr auto", gap: 0, alignItems: "stretch",
        border: "1px solid rgba(255,255,255,.22)", borderRadius: 18, overflow: "visible",
        background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", position: "relative" }}>

        <GlassField label="Destination" icon={<Icon.pin size={14} />} accent="var(--sky)"
          value={`${city.city}`} sub={city.country} onClick={() => setCityOpen(o => !o)} open={cityOpen}>
          {cityOpen && (
            <GlassPicker items={cityChoices} onPick={(c) => { setCity(c); setCityOpen(false); }} placeholder="Search a city" />
          )}
        </GlassField>

        <GlassDateField label="Check in" value={checkIn} onChange={setCheckIn} accent="var(--sky)" />
        <GlassDateField label="Check out" value={checkOut} onChange={setCheckOut} accent="var(--sky)" />

        <GlassStepperField label="Guests · Rooms" accent="var(--sky)"
          summary={`${adults} guest${adults > 1 ? "s" : ""} · ${rooms} room${rooms > 1 ? "s" : ""}`}
          steppers={[
            { label: "Adults", value: adults, set: setAdults, min: 1, max: 9 },
            { label: "Rooms", value: rooms, set: setRooms, min: 1, max: 6 },
          ]} />

        <button onClick={runSearch} className="lift chip-shine" style={{
          background: "linear-gradient(135deg, var(--sky), #3a5a8c)", color: "var(--cream)", border: "none",
          borderRadius: "0 18px 18px 0", padding: "0 26px", display: "inline-flex", alignItems: "center", gap: 10,
          fontSize: 14, letterSpacing: ".06em", fontWeight: 500, position: "relative", overflow: "hidden" }}>
          {loading ? <span className="spinner" /> : <Icon.search size={16} />} Search hotels
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 6px 4px", flexWrap: "wrap" }}>
        {["Free cancellation", "Breakfast included", "Pool", "5-star", "Near centre"].map((c) => (
          <button key={c} className="chip-shine lift" style={{
            background: "rgba(255,255,255,.08)", color: "rgba(251,247,238,.9)", border: "1px solid rgba(255,255,255,.22)",
            padding: "7px 14px", borderRadius: 999, fontSize: 12, backdropFilter: "blur(10px)", position: "relative", overflow: "hidden" }}>{c}</button>
        ))}
      </div>

      {(loading || results) && (
        <ResultsOverlay title={`Hotels in ${city.city}`} onClose={() => setResults(null)} loading={loading}
          count={results?.length || 0} accent="var(--sky)">
          {results?.map((s) => (
            <StayCard key={s.id} stay={s} onReserve={() => setBooking(s)} />
          ))}
          {results && results.length === 0 && <EmptyState text="No stays matched — try different dates." />}
        </ResultsOverlay>
      )}

      {booking && (
        <BookingOverlay
          kind="hotel"
          title={booking.accommodation?.name || "Confirm stay"}
          priceLabel={fmtMoney(Math.round(parseFloat(booking.cheapestRateTotalAmount || "0")))}
          onClose={() => setBooking(null)}
          onConfirm={async (guest) => {
            // Real Duffel Stays needs search→rates→quote→booking; without a live quote we confirm a demo booking.
            return { reference: "EHT-STAY-" + Math.random().toString(36).slice(2, 8).toUpperCase(), _mock: booking._mock !== false };
          }}
        />
      )}
    </div>
  );
};

window.HotelSearchPanel = HotelSearchPanel;
