// Seat selection screen — 3D tilted cabin map with cinematic detail
const ROW_COUNT = 28;
const SEAT_LETTERS = ["A","B","C","D","E","F"]; // 3-3 layout
const EMERGENCY_ROWS = [12, 13];
const PREMIUM_ROWS = [3, 4, 5, 6, 7];
const BLOCKED_SEATS = new Set([
  "1A","1B","1C","2D","2E","2F","8C","9D","11A","14F","15B","16E","18A","19F","20C","21D","22A","23F","24B","25E","26C","27D","28A"
]);

function seatPrice(row, col) {
  if (PREMIUM_ROWS.includes(row)) return 88;
  if (EMERGENCY_ROWS.includes(row)) return 38;
  if (col === "A" || col === "F") return 22;          // window
  if (col === "C" || col === "D") return 12;          // aisle
  return 0;                                            // middle, free
}
function seatTier(row, col) {
  if (PREMIUM_ROWS.includes(row)) return "premium";
  if (EMERGENCY_ROWS.includes(row)) return "emergency";
  if (col === "A" || col === "F") return "window";
  if (col === "C" || col === "D") return "aisle";
  return "standard";
}
function seatColor(tier, taken, sel) {
  if (taken) return "rgba(11,26,43,.18)";
  if (sel) return "var(--sun)";
  if (tier === "premium") return "#1f3a5a";
  if (tier === "emergency") return "#b54a1d";
  return "white";
}

const ScreenSeats = ({ flight, query, selectedSeat, setSelectedSeat, onContinue, onBack }) => {
  const [tilt, setTilt] = useState(true);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh", paddingTop: 130 }}>
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "20px 40px 40px" }}>
        {/* Title row */}
        <div className="rise" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30, gap: 24 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .6 }}>Step 02 — Pick your perch</div>
            <h2 className="serif" style={{ fontSize: "clamp(50px, 7vw, 96px)", lineHeight: .95, margin: "8px 0 0", letterSpacing: "-.02em", fontWeight: 400 }}>
              Choose <span className="italic">where</span> you sit.
            </h2>
            <div style={{ marginTop: 14, fontSize: 14, color: "var(--ink-3)", maxWidth: 540 }}>
              {flight.carrier.name} {flight.id} · {flight.aircraft} · {fmtDuration(flight.durationMin)} from {query.origin.city} to {query.dest.city}.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTilt(t => !t)} style={{
              background: tilt ? "var(--ink)" : "transparent", color: tilt ? "var(--cream)" : "var(--ink)",
              border: "1px solid", borderColor: tilt ? "var(--ink)" : "var(--line)",
              padding: "8px 14px", borderRadius: 999, fontSize: 12, letterSpacing: ".06em",
              display: "inline-flex", alignItems: "center", gap: 8
            }}>
              {tilt ? "3D view" : "Top-down"}
            </button>
          </div>
        </div>

        {/* Cabin + side rail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 30, alignItems: "flex-start" }}>
          {/* Cabin stage */}
          <div className="rise rise-d1" style={{
            position: "relative",
            background: "linear-gradient(180deg, #eee5d2 0%, #f7efdf 100%)",
            border: "1px solid var(--line)", borderRadius: 28, padding: "40px 24px 60px",
            overflow: "hidden", minHeight: 720,
            perspective: 1400, perspectiveOrigin: "50% 30%"
          }}>
            {/* Decorative grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .25 }}>
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(11,26,43,.2)" strokeWidth=".5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Compass / labels */}
            <div className="mono" style={{ position: "absolute", left: 24, top: 18, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", opacity: .55 }}>
              Cabin schematic · {flight.aircraft}
            </div>
            <div className="mono" style={{ position: "absolute", right: 24, top: 18, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", opacity: .55 }}>
              Direction of flight ↑
            </div>

            {/* The plane */}
            <div style={{
              transform: tilt ? "rotateX(45deg) rotateZ(0deg) translateY(-20px) scale(.96)" : "rotateX(0deg)",
              transformStyle: "preserve-3d",
              transition: "transform .9s cubic-bezier(.2,.7,.2,1)",
              margin: "0 auto",
              width: 520
            }}>
              {/* nose */}
              <Fuselage>
                <Nose />
                {/* rows */}
                <div style={{ padding: "20px 24px 0", position: "relative" }}>
                  {/* row letters */}
                  <div style={{ display: "grid", gridTemplateColumns: "20px repeat(3, 36px) 30px repeat(3, 36px) 20px", gap: 6, marginBottom: 8 }}>
                    <span/>
                    {SEAT_LETTERS.slice(0,3).map(l => <span key={l} className="mono" style={{ textAlign: "center", fontSize: 10, opacity: .55 }}>{l}</span>)}
                    <span/>
                    {SEAT_LETTERS.slice(3,6).map(l => <span key={l} className="mono" style={{ textAlign: "center", fontSize: 10, opacity: .55 }}>{l}</span>)}
                    <span/>
                  </div>

                  {Array.from({ length: ROW_COUNT }).map((_, idx) => {
                    const row = idx + 1;
                    const isExit = EMERGENCY_ROWS.includes(row);
                    return (
                      <div key={row} style={{
                        display: "grid", gridTemplateColumns: "20px repeat(3, 36px) 30px repeat(3, 36px) 20px",
                        gap: 6, marginBottom: 4, position: "relative"
                      }}>
                        <span className="mono" style={{ fontSize: 10, opacity: .5, textAlign: "right", paddingRight: 4, alignSelf: "center" }}>{row}</span>
                        {SEAT_LETTERS.slice(0,3).map(c => <Seat key={c} row={row} col={c} sel={selectedSeat} setSel={setSelectedSeat} hovered={hovered} setHovered={setHovered} />)}
                        <span style={{ alignSelf: "center", textAlign: "center", fontSize: 9, opacity: .35, fontFamily: "var(--mono)" }}>
                          {isExit ? "EXIT" : ""}
                        </span>
                        {SEAT_LETTERS.slice(3,6).map(c => <Seat key={c} row={row} col={c} sel={selectedSeat} setSel={setSelectedSeat} hovered={hovered} setHovered={setHovered} />)}
                        <span className="mono" style={{ fontSize: 10, opacity: .5, paddingLeft: 4, alignSelf: "center" }}>{row}</span>

                        {/* exit lights */}
                        {isExit && <>
                          <span style={{ position: "absolute", left: -2, top: "50%", width: 8, height: 8, borderRadius: 999, background: "var(--sun)", boxShadow: "0 0 12px var(--sun)" }} />
                          <span style={{ position: "absolute", right: -2, top: "50%", width: 8, height: 8, borderRadius: 999, background: "var(--sun)", boxShadow: "0 0 12px var(--sun)" }} />
                        </>}

                        {/* premium divider */}
                        {row === 7 && <div style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 1, background: "var(--ink-3)", opacity: .35 }}>
                          <span className="mono" style={{ position: "absolute", right: 0, top: -16, fontSize: 9, letterSpacing: ".18em", opacity: .55 }}>↑ PREMIUM ECONOMY</span>
                        </div>}
                      </div>
                    );
                  })}
                </div>
                {/* Tail */}
                <Tail />
              </Fuselage>
            </div>

            {/* Floor shadow */}
            <div style={{
              position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)",
              width: 460, height: 24, borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(11,26,43,.18), transparent 70%)",
              filter: "blur(2px)", pointerEvents: "none"
            }} />
          </div>

          {/* Right rail */}
          <aside className="rise rise-d2" style={{ position: "sticky", top: 130, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Legend */}
            <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 18, padding: 18 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55, marginBottom: 12 }}>Legend</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <Legend swatch="white" border label="Standard"/>
                <Legend swatch="#1f3a5a" label="Premium · $88"/>
                <Legend swatch="#b54a1d" label="Exit row · $38"/>
                <Legend swatch="var(--sun)" label="Selected"/>
                <Legend swatch="rgba(11,26,43,.18)" label="Taken"/>
                <Legend swatch="white" dashed label="Window/aisle +"/>
              </div>
            </div>

            {/* Selection card */}
            <div style={{ background: "var(--ink)", color: "var(--cream)", borderRadius: 18, padding: 22, position: "relative", overflow: "hidden" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>Your seat</div>
              {selectedSeat ? (
                <>
                  <div className="serif" style={{ fontSize: 96, lineHeight: 1, margin: "8px 0 0", letterSpacing: "-.03em" }}>
                    {selectedSeat.row}<span style={{ color: "var(--sun)" }}>{selectedSeat.col}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 8, opacity: .8, textTransform: "uppercase", letterSpacing: ".18em" }}>
                    Row {selectedSeat.row} · {seatTier(selectedSeat.row, selectedSeat.col)} · +{fmtMoney(seatPrice(selectedSeat.row, selectedSeat.col))}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", fontSize: 13, opacity: .85, lineHeight: 1.7 }}>
                    <li>· {(selectedSeat.col === "A" || selectedSeat.col === "F") ? "Window view" : (selectedSeat.col === "C" || selectedSeat.col === "D") ? "Aisle access" : "Middle seat"}</li>
                    <li>· 31" pitch · 18.5" width</li>
                    <li>· In-seat USB-C, 110V outlet</li>
                    <li>· {EMERGENCY_ROWS.includes(selectedSeat.row) ? "Extra legroom (exit row)" : PREMIUM_ROWS.includes(selectedSeat.row) ? "5\" extra recline · priority boarding" : "Standard recline"}</li>
                  </ul>
                </>
              ) : (
                <>
                  <div className="serif" style={{ fontSize: 64, lineHeight: 1, margin: "8px 0 0", color: "rgba(251,247,238,.4)" }}>--</div>
                  <div style={{ fontSize: 13, marginTop: 12, opacity: .7 }}>Tap a seat to inspect it. We'll show legroom, view, and any add-on price here.</div>
                </>
              )}
              {/* Plane silhouette decorative */}
              <div style={{ position: "absolute", right: -30, bottom: -30, opacity: .12, pointerEvents: "none" }}>
                <Icon.plane size={140}/>
              </div>
            </div>

            {/* Quick fill buttons */}
            <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 18, padding: 18 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55, marginBottom: 10 }}>Quick choose</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Best window", row: 5, col: "A" },
                  { label: "Aisle near front", row: 6, col: "C" },
                  { label: "Extra legroom", row: 12, col: "A" },
                  { label: "Quietest spot", row: 22, col: "F" }
                ].map(opt => (
                  <button key={opt.label} onClick={() => setSelectedSeat({ row: opt.row, col: opt.col })}
                    style={{
                      background: "transparent", textAlign: "left", padding: "10px 12px",
                      border: "1px solid var(--line)", borderRadius: 12, fontSize: 13,
                      display: "flex", justifyContent: "space-between", cursor: "pointer"
                    }}>
                    <span>{opt.label}</span>
                    <span className="mono" style={{ opacity: .7 }}>{opt.row}{opt.col}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ActionBar
        left={<div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>Flight + seat</div>
          <div style={{ fontWeight: 500 }}>
            {flight.carrier.name} {flight.id} · {selectedSeat ? `Seat ${selectedSeat.row}${selectedSeat.col}` : "no seat yet"}
          </div>
        </div>}
        right={<div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 10, opacity: .55, letterSpacing: ".18em", textTransform: "uppercase" }}>Subtotal</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1 }}>
            {fmtMoney(flight.price + (selectedSeat ? seatPrice(selectedSeat.row, selectedSeat.col) : 0))}
          </div>
        </div>}
        secondary="Back"
        onSecondary={onBack}
        primary="Add passenger"
        onPrimary={onContinue}
        primaryDisabled={!selectedSeat}
      />
    </div>
  );
};

// ----- Cabin parts -----
function Fuselage({ children }) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--line)",
      boxShadow: "0 30px 60px -30px rgba(11,26,43,.35), inset 0 1px 0 rgba(255,255,255,.8)",
      position: "relative"
    }}>
      {children}
    </div>
  );
}
function Nose() {
  return (
    <div style={{ position: "relative", height: 90 }}>
      <svg viewBox="0 0 520 90" width="100%" height="100%" preserveAspectRatio="none">
        <path d="M 0 90 L 0 30 Q 260 -40 520 30 L 520 90 Z" fill="white" stroke="var(--line)" strokeWidth="1"/>
        <line x1="50" y1="50" x2="470" y2="50" stroke="var(--line)" strokeDasharray="3 3" />
        <text x="260" y="58" textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "rgba(11,26,43,.45)", letterSpacing: ".2em" }}>FIRST · BUSINESS</text>
      </svg>
    </div>
  );
}
function Tail() {
  return (
    <div style={{ position: "relative", height: 110, marginTop: 8 }}>
      <svg viewBox="0 0 520 110" width="100%" height="100%" preserveAspectRatio="none">
        <path d="M 60 0 L 460 0 Q 520 0 470 60 L 280 110 L 220 110 L 50 60 Q 0 0 60 0 Z" fill="white" stroke="var(--line)" strokeWidth="1"/>
        <text x="260" y="40" textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: "rgba(11,26,43,.45)", letterSpacing: ".2em" }}>GALLEY · LAVATORY</text>
      </svg>
    </div>
  );
}

function Seat({ row, col, sel, setSel, hovered, setHovered }) {
  const id = `${row}${col}`;
  const taken = BLOCKED_SEATS.has(id);
  const isSel = sel && sel.row === row && sel.col === col;
  const tier = seatTier(row, col);
  const fill = seatColor(tier, taken, isSel);
  const border = taken ? "var(--line)" : tier === "premium" ? "#1f3a5a" : tier === "emergency" ? "#b54a1d" : "var(--ink-3)";
  return (
    <button
      disabled={taken}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => !taken && setSel({ row, col })}
      style={{
        position: "relative",
        width: 36, height: 32, borderRadius: "10px 10px 6px 6px",
        background: fill, border: "1.4px solid", borderColor: border,
        cursor: taken ? "not-allowed" : "pointer", padding: 0,
        boxShadow: isSel ? "0 8px 18px -6px rgba(227,107,58,.7)" : "inset 0 -3px 0 rgba(11,26,43,.06)",
        transition: "all .2s ease",
        transform: isSel ? "scale(1.08)" : (hovered === id && !taken ? "scale(1.04)" : "scale(1)"),
      }}
      title={taken ? "Taken" : `Seat ${id} · +${fmtMoney(seatPrice(row, col))}`}
    >
      {/* seat headrest */}
      <span style={{
        position: "absolute", top: 3, left: 6, right: 6, height: 6, borderRadius: 4,
        background: taken ? "rgba(11,26,43,.25)" : isSel ? "rgba(255,255,255,.4)" : (tier === "premium" || tier === "emergency") ? "rgba(255,255,255,.25)" : "rgba(11,26,43,.1)"
      }} />
      {isSel && <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "white" }}>
        <Icon.check size={14} />
      </span>}
    </button>
  );
}

function Legend({ swatch, label, border, dashed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 14, height: 14, background: swatch, borderRadius: 4,
        border: border ? "1.4px solid var(--ink-3)" : (dashed ? "1.4px dashed var(--ink)" : "1.4px solid transparent")
      }}/>
      <span>{label}</span>
    </div>
  );
}

window.ScreenSeats = ScreenSeats;
window.seatPrice = seatPrice;
