// Cars search panel — additive. Renders inside the existing glass search panel when
// mode === "cars". Accent: --grass. Cars are a MOCK subgraph (Duffel has no car API),
// so results come from EHT_API's client-side fallback until a real provider is wired.

const CarSearchPanel = () => {
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [pickup, setPickup] = useState(AIRPORTS.find(a => a.code === "LAX") || AIRPORTS[0]);
  const [dropoff, setDropoff] = useState(null); // null = same as pickup
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [age, setAge] = useState(30);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [booking, setBooking] = useState(null);

  const choices = useMemo(() => AIRPORTS.map(a => ({ code: a.code, city: a.city, country: a.name })), []);

  async function runSearch() {
    setLoading(true); setResults(null);
    const list = await EHT_API.searchCars({
      pickupLocation: `${pickup.city} (${pickup.code})`,
      dropoffLocation: dropoff ? `${dropoff.city} (${dropoff.code})` : `${pickup.city} (${pickup.code})`,
      pickupDate: pickupDate ? pickupDate + "T10:00" : undefined,
      dropoffDate: dropoffDate ? dropoffDate + "T10:00" : undefined,
      driverAge: age,
    });
    setLoading(false); setResults(list);
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr .8fr auto", gap: 0, alignItems: "stretch",
        border: "1px solid rgba(255,255,255,.22)", borderRadius: 18, overflow: "visible",
        background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", position: "relative" }}>

        <GlassField label="Pick-up" icon={<Icon.pin size={14} />} accent="var(--grass)"
          value={pickup.city} sub={pickup.code} onClick={() => { setPickupOpen(o => !o); setDropoffOpen(false); }} open={pickupOpen}>
          {pickupOpen && <GlassPicker items={choices} onPick={(c) => { setPickup(AIRPORTS.find(a => a.code === c.code)); setPickupOpen(false); }} placeholder="City or airport" />}
        </GlassField>

        <GlassField label="Drop-off" icon={<Icon.pin size={14} />} accent="var(--grass)"
          value={dropoff ? dropoff.city : "Same as pick-up"} sub={dropoff ? dropoff.code : "one location"} onClick={() => { setDropoffOpen(o => !o); setPickupOpen(false); }} open={dropoffOpen}>
          {dropoffOpen && <GlassPicker items={[{ code: "SAME", city: "Same as pick-up", country: "return to origin" }, ...choices]} onPick={(c) => { setDropoff(c.code === "SAME" ? null : AIRPORTS.find(a => a.code === c.code)); setDropoffOpen(false); }} placeholder="City or airport" />}
        </GlassField>

        <GlassDateField label="From" value={pickupDate} onChange={setPickupDate} accent="var(--grass)" />
        <GlassDateField label="Until" value={dropoffDate} onChange={setDropoffDate} accent="var(--grass)" />

        <GlassStepperField label="Driver age" accent="var(--grass)" summary={`${age} yrs`}
          steppers={[{ label: "Driver age", value: age, set: setAge, min: 18, max: 90 }]} />

        <button onClick={runSearch} className="lift chip-shine" style={{
          background: "linear-gradient(135deg, var(--grass), #234a2c)", color: "var(--cream)", border: "none",
          borderRadius: "0 18px 18px 0", padding: "0 26px", display: "inline-flex", alignItems: "center", gap: 10,
          fontSize: 14, letterSpacing: ".06em", fontWeight: 500, position: "relative", overflow: "hidden" }}>
          {loading ? <span className="spinner" /> : <Icon.search size={16} />} Search cars
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 6px 4px", flexWrap: "wrap", alignItems: "center" }}>
        {["Automatic", "SUV", "Unlimited miles", "Free cancellation"].map((c) => (
          <button key={c} className="chip-shine lift" style={{ background: "rgba(255,255,255,.08)", color: "rgba(251,247,238,.9)", border: "1px solid rgba(255,255,255,.22)", padding: "7px 14px", borderRadius: 999, fontSize: 12, backdropFilter: "blur(10px)", position: "relative", overflow: "hidden" }}>{c}</button>
        ))}
        <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", opacity: .55, marginLeft: 4 }}>demo inventory · provider-ready schema</span>
      </div>

      {(loading || results) && (
        <ResultsOverlay title={`Cars · ${pickup.city}`} onClose={() => setResults(null)} loading={loading} count={results?.length || 0} accent="var(--grass)">
          {results?.map((c) => <CarCard key={c.id} car={c} onReserve={() => setBooking(c)} />)}
          {results && results.length === 0 && <EmptyState text="No cars available for those dates." />}
        </ResultsOverlay>
      )}

      {booking && (
        <BookingOverlay kind="car" title={`${booking.vehicleName} · ${booking.vehicleClass}`}
          priceLabel={fmtMoney(Math.round(parseFloat(booking.totalAmount || "0")))}
          onClose={() => setBooking(null)}
          onConfirm={async () => ({ reference: "EHT-CAR-" + Math.random().toString(36).slice(2, 8).toUpperCase(), _mock: true })} />
      )}
    </div>
  );
};

window.CarSearchPanel = CarSearchPanel;
