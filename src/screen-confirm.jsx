// Confirmation screen — boarding pass reveal
const ScreenConfirm = ({ flight, query, selectedSeat, passenger, onReset }) => {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 350);
    return () => clearTimeout(t);
  }, []);

  const bookingRef = useMemo(() => {
    const seed = (passenger.last || "AERIA") + flight.id;
    const rnd = randSeed(seed);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += chars[Math.floor(rnd() * chars.length)];
    return s;
  }, [passenger.last, flight.id]);

  const gate = useMemo(() => {
    const r = randSeed(bookingRef);
    return ["A", "B", "C", "D"][Math.floor(r() * 4)] + (1 + Math.floor(r() * 32));
  }, [bookingRef]);

  return (
    <div style={{
      background: `radial-gradient(ellipse at 50% -10%, rgba(227,107,58,.18), transparent 60%), var(--cream)`,
      color: "var(--ink)", minHeight: "100vh", paddingTop: 130, paddingBottom: 80,
      overflow: "hidden", position: "relative"
    }}>
      {/* drifting plane */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .12 }}>
        <div style={{ position: "absolute", top: "30%", animation: "plane-drift 30s linear infinite" }}>
          <Icon.plane size={60}/>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 40px 0", position: "relative" }}>
        <div className="rise" style={{ textAlign: "center", marginBottom: 30 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", opacity: .6 }}>
            ⤳ Confirmed · {bookingRef} · {new Date().toUTCString().slice(0, 16)}
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(64px, 9vw, 120px)", lineHeight: .95, margin: "10px 0 0", letterSpacing: "-.025em", fontWeight: 400 }}>
            You're <span className="italic">flying</span>.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-3)", maxWidth: 540, marginInline: "auto" }}>
            We sent the receipt to <strong>{passenger.email}</strong>. Your boarding pass lives in this app and in Wallet, ready 24h before takeoff.
          </p>
        </div>

        {/* Boarding pass */}
        <div className="rise rise-d2" style={{
          margin: "24px auto 0", maxWidth: 980,
          transform: revealed ? "rotate(-1deg) translateY(0)" : "rotate(2deg) translateY(40px)",
          opacity: revealed ? 1 : 0,
          transition: "all 1.1s cubic-bezier(.2,.7,.2,1)"
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 280px",
            background: "white", borderRadius: 20, overflow: "hidden",
            boxShadow: "0 40px 90px -30px rgba(11,26,43,.5), 0 0 0 1px rgba(11,26,43,.06)",
            position: "relative",
            minHeight: 360
          }}>
            {/* Notch holes */}
            <span style={{ position: "absolute", left: "calc(100% - 280px - 12px)", top: -12, width: 24, height: 24, borderRadius: 999, background: "var(--cream)" }}/>
            <span style={{ position: "absolute", left: "calc(100% - 280px - 12px)", bottom: -12, width: 24, height: 24, borderRadius: 999, background: "var(--cream)" }}/>

            {/* Main panel */}
            <div style={{ padding: "30px 36px", position: "relative" }}>
              {/* Top brand */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, border: "1px solid var(--ink)", borderRadius: 999, display: "inline-grid", placeItems: "center" }}><Icon.plane size={14}/></span>
                  <span className="serif" style={{ fontSize: 28, lineHeight: 1, letterSpacing: ".02em" }}>aeria</span>
                  <span className="mono" style={{ fontSize: 10, marginLeft: 10, padding: "2px 6px", border: "1px solid var(--ink)", letterSpacing: ".18em" }}>BOARDING PASS</span>
                </div>
                <div className="mono" style={{ textAlign: "right", fontSize: 11, opacity: .7, letterSpacing: ".12em", textTransform: "uppercase", lineHeight: 1.5 }}>
                  {flight.carrier.name}<br/>Flight {flight.id} · {flight.aircraft}
                </div>
              </div>

              {/* Big route */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center" }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>{query.origin.city}</div>
                  <div className="serif" style={{ fontSize: 96, lineHeight: 1, letterSpacing: "-.03em" }}>{flight.origin}</div>
                  <div className="mono" style={{ fontSize: 12, opacity: .8, marginTop: 6 }}>{query.origin.name}</div>
                </div>
                <div style={{ color: "var(--sun)" }}><Icon.plane size={36}/></div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>{query.dest.city}</div>
                  <div className="serif" style={{ fontSize: 96, lineHeight: 1, letterSpacing: "-.03em" }}>{flight.dest}</div>
                  <div className="mono" style={{ fontSize: 12, opacity: .8, marginTop: 6 }}>{query.dest.name}</div>
                </div>
              </div>

              {/* Detail strip */}
              <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, paddingTop: 20, borderTop: "1px dashed var(--line)" }}>
                <Detail label="Passenger" value={`${passenger.first || "Iris"} ${passenger.last || "Whittaker"}`.toUpperCase()} />
                <Detail label="Date"      value={query.departLabel} />
                <Detail label="Boarding"  value={fmtTime(Math.max(0, flight.depMin - 30))} />
                <Detail label="Departs"   value={fmtTime(flight.depMin)} />
                <Detail label="Gate"      value={gate} />
              </div>

              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                <Detail label="Seat"     value={selectedSeat ? `${selectedSeat.row}${selectedSeat.col}` : "12A"} accent />
                <Detail label="Cabin"    value={selectedSeat && PREMIUM_ROWS.includes(selectedSeat.row) ? "Premium" : "Economy"} />
                <Detail label="Group"    value="2" />
                <Detail label="Sequence" value="037" />
              </div>

              {/* Foot */}
              <div className="mono" style={{ marginTop: 28, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .55, display: "flex", justifyContent: "space-between" }}>
                <span>This pass is your ticket. Have ID ready at the gate.</span>
                <span>e-Ticket {bookingRef}-01</span>
              </div>
            </div>

            {/* Right stub */}
            <div style={{ background: "var(--ink)", color: "var(--cream)", padding: 26, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .65 }}>Booking ref</div>
                <div className="serif" style={{ fontSize: 40, lineHeight: 1, letterSpacing: ".05em", marginTop: 4 }}>{bookingRef}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                <div style={{ background: "var(--cream)", padding: 8, borderRadius: 8 }}>
                  <Icon.qr size={140} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <StubItem label="Seat" value={selectedSeat ? `${selectedSeat.row}${selectedSeat.col}` : "—"} accent/>
                <StubItem label="Gate" value={gate} />
                <StubItem label="Boards" value={fmtTime(Math.max(0, flight.depMin - 30))} />
                <StubItem label="Flight" value={flight.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="rise rise-d3" style={{ marginTop: 50, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { t: "Add to Wallet", d: "Apple Wallet · Google Wallet", icon: <Icon.cardChip size={20}/> },
            { t: "Plan {city} arrival".replace("{city}", query.dest.city), d: "Curated guides, pre-booked SIM, transit pass", icon: <Icon.pin size={20}/> },
            { t: "Earn 4,820 miles", d: "Posts to your Aeria Loyalty account in 24h", icon: <Icon.star size={20}/> },
          ].map((c, i) => (
            <div key={i} style={{ background: "white", border: "1px solid var(--line)", borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 999, background: "var(--paper)", display: "inline-grid", placeItems: "center", color: "var(--ink)" }}>{c.icon}</span>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{c.t}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.d}</div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: .7, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sun-deep)" }}>
                Continue <Icon.arrow size={12}/>
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 46 }}>
          <button onClick={onReset} style={{
            background: "transparent", border: "1px solid var(--line)", color: "var(--ink)",
            padding: "12px 22px", borderRadius: 999, fontSize: 13, letterSpacing: ".06em",
            display: "inline-flex", alignItems: "center", gap: 10
          }}>
            <Icon.search size={14}/> Book another flight
          </button>
        </div>
      </div>
    </div>
  );
};

function Detail({ label, value, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>{label}</div>
      <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 2, color: accent ? "var(--sun-deep)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}
function StubItem({ label, value, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>{label}</div>
      <div className="serif" style={{ fontSize: 18, lineHeight: 1.1, color: accent ? "var(--sun)" : "inherit" }}>{value}</div>
    </div>
  );
}

window.ScreenConfirm = ScreenConfirm;
