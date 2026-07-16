// Top-level App — manages stage transitions and shared state
const { ScreenSearch, ScreenResults, ScreenSeats, ScreenPassenger, ScreenConfirm,
        TopNav, StepRail, Icon, fmtMoney, FloatingTravelAssistant } = window;

function App() {
  const [stage, setStage] = useState("search"); // search | results | seats | passenger | confirm
  const [searching, setSearching] = useState(false);

  const [query, setQuery] = useState({
    tripType: "Round trip",
    origin: AIRPORTS.find(a => a.code === "JFK"),
    dest:   AIRPORTS.find(a => a.code === "HND"),
    departLabel: "Fri 12 Jun",
    departWeek: "Friday · Spring",
    returnLabel: "Sun 28 Jun",
    returnWeek: "Sunday · Summer",
  });

  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState({ row: 12, col: "A" });
  const [passenger, setPassenger] = useState({
    first: "", last: "", email: "", phone: "", dob: "", nat: "United States",
    passport: "", ff: "", addons: ["bag"]
  });
  const [payment, setPayment] = useState({ number: "", name: "", exp: "", cvv: "", zip: "" });

  // Resolve flights via the federated GraphQL supergraph (Duffel through Apollo Router).
  // EHT_API.searchFlights returns live Duffel offers mapped to the UI's flight shape, and
  // transparently falls back to the local generator when the router/token is unavailable —
  // so behaviour and visuals are unchanged whether or not the backend is live.
  function runSearch() {
    setSearching(true);
    setSelectedFlight(null);
    const minVeil = new Promise((r) => setTimeout(r, 900)); // preserve the search animation
    Promise.all([window.EHT_API.searchFlights(query), minVeil])
      .then(([list]) => setFlights(list && list.length ? list : makeFlights(query.origin.code, query.dest.code, query.departLabel)))
      .catch(() => setFlights(makeFlights(query.origin.code, query.dest.code, query.departLabel)))
      .finally(() => { setSearching(false); setStage("results"); });
  }

  function reset() {
    setStage("search");
    setSelectedFlight(null);
    setSelectedSeat({ row: 12, col: "A" });
    setPassenger({ first: "", last: "", email: "", phone: "", dob: "", nat: "United States", passport: "", ff: "", addons: ["bag"] });
    setPayment({ number: "", name: "", exp: "", cvv: "", zip: "" });
  }

  return (
    <div data-screen-label={`Stage · ${stage}`}>
      <TopNav stage={stage} onReset={reset} />
      <StepRail stage={stage} />

      {/* Search loading veil */}
      {searching && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,26,43,.92)",
          color: "var(--cream)", display: "grid", placeItems: "center", textAlign: "center",
          backdropFilter: "blur(8px)"
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 14, opacity: .85, fontFamily: "var(--mono)", letterSpacing: ".22em", textTransform: "uppercase" }}>
              <span className="spinner" /> Searching corridors
            </div>
            <div className="serif" style={{ fontSize: 56, marginTop: 18, letterSpacing: "-.02em" }}>
              {query.origin.city} <span className="italic">to</span> {query.dest.city}
            </div>
            <div className="mono" style={{ marginTop: 10, fontSize: 11, opacity: .65, letterSpacing: ".18em", textTransform: "uppercase" }}>
              Scanning 248 flights · holding price · 12 carriers
            </div>
            {/* animated arc */}
            <svg viewBox="0 0 600 80" width="420" style={{ display: "block", margin: "30px auto 0", overflow: "visible" }}>
              <path d="M 20 60 Q 300 -40 580 60" fill="none" stroke="rgba(251,247,238,.4)" strokeWidth="1" strokeDasharray="3 6" />
              <circle cx="20" cy="60" r="5" fill="var(--cream)" />
              <circle cx="580" cy="60" r="5" fill="var(--sun)" />
              <g transform="translate(300, -10)" style={{ color: "var(--sun)", animation: "plane-drift 2s ease-in-out infinite alternate" }}>
                <g transform="translate(-12,-12) rotate(95 12 12)"><Icon.plane size={24}/></g>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Stages */}
      <div key={stage} className="screen-fade-active screen-fade-enter" style={{ animation: "rise .55s cubic-bezier(.2,.7,.2,1) both" }}>
        {stage === "search" && (
          <ScreenSearch
            onSearch={runSearch}
            query={query}
            setQuery={setQuery}
          />
        )}
        {stage === "results" && (
          <ScreenResults
            query={query}
            flights={flights}
            selected={selectedFlight}
            onSelect={setSelectedFlight}
            onContinue={() => setStage("seats")}
            onBack={() => setStage("search")}
          />
        )}
        {stage === "seats" && (
          <ScreenSeats
            flight={selectedFlight}
            query={query}
            selectedSeat={selectedSeat}
            setSelectedSeat={setSelectedSeat}
            onContinue={() => setStage("passenger")}
            onBack={() => setStage("results")}
          />
        )}
        {stage === "passenger" && (
          <ScreenPassenger
            flight={selectedFlight}
            query={query}
            selectedSeat={selectedSeat}
            passenger={passenger}
            setPassenger={setPassenger}
            payment={payment}
            setPayment={setPayment}
            onContinue={() => setStage("confirm")}
            onBack={() => setStage("seats")}
          />
        )}
        {stage === "confirm" && (
          <ScreenConfirm
            flight={selectedFlight}
            query={query}
            selectedSeat={selectedSeat}
            passenger={passenger}
            onReset={reset}
          />
        )}
      </div>
      <FloatingTravelAssistant />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
