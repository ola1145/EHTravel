// Hero search screen - cinematic landing with destination cards
const ScreenSearch = ({ onSearch, query, setQuery }) => {
  const [activeDest, setActiveDest] = useState(0);
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [parallaxX, setParallaxX] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const heroRef = useRef(null);

  // gentle parallax on the hero image based on cursor position
  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      setParallaxX(px); setParallaxY(py);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // auto-rotate the destination strip
  useEffect(() => {
    const t = setInterval(() => setActiveDest(d => (d + 1) % DESTINATIONS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const dest = DESTINATIONS[activeDest];

  return (
    <div style={{ background: "var(--ink)", color: "var(--cream)", minHeight: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Cinematic hero image */}
      <div ref={heroRef} style={{ position: "absolute", inset: 0 }}>
        {DESTINATIONS.map((d, i) => (
          <div key={d.code} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${d.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${i === activeDest ? 1.04 : 1.12}) translate(${parallaxX * -18}px, ${parallaxY * -10}px)`,
            transition: "opacity 1.6s ease, transform 6s ease",
            opacity: i === activeDest ? 1 : 0,
          }} />
        ))}
        {/* graded overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, rgba(11,26,43,.55) 0%, rgba(11,26,43,.25) 35%, rgba(11,26,43,.85) 100%), radial-gradient(ellipse at 30% 20%, ${dest.hue}, transparent 55%)`,
          transition: "background 1.6s ease"
        }} />
        {/* subtle film grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "3px 3px", mixBlendMode: "overlay", opacity: .35
        }} />
      </div>

      {/* Drifting plane far behind */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "rgba(255,255,255,.15)" }}>
        <div style={{ position: "absolute", top: "22%", animation: "plane-drift 22s linear infinite", width: 90 }}>
          <Icon.plane size={56} />
        </div>
      </div>

      {/* Top frame markers */}
      <div style={{ position: "absolute", top: 18, right: 28, display: "flex", gap: 8, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", opacity: .65, zIndex: 10 }}>
        <span>52.36°N</span><span>·</span><span>{(parallaxX*4 + 4.89).toFixed(2)}°W</span>
      </div>

      {/* Main hero content */}
      <div style={{ position: "relative", zIndex: 5, paddingTop: 110, paddingLeft: 40, paddingRight: 40, paddingBottom: 60, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Eyebrow */}
        <div className="mono rise" style={{ fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", opacity: .8 }}>
          ↳ Issue 04 — Spring corridor open
        </div>

        {/* Headline */}
        <h1 className="serif rise rise-d1" style={{
          fontSize: "clamp(72px, 11.5vw, 200px)",
          lineHeight: .92, margin: "20px 0 0 -6px", maxWidth: 1300,
          letterSpacing: "-0.025em", fontWeight: 400
        }}>
          Pack light.<br/>
          <span className="italic" style={{ color: "var(--paper)" }}>Fly somewhere</span><br/>
          worth telling.
        </h1>

        <div style={{ flex: 1 }} />

        {/* Active destination caption */}
        <div className="rise rise-d2" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 20 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>Now showing — {dest.tag}</div>
            <div className="serif" style={{ fontSize: 38, lineHeight: 1, marginTop: 6 }}>
              {dest.city}, <span className="italic" style={{ opacity: .85 }}>{dest.country}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {DESTINATIONS.map((d, i) => (
              <button key={d.code} onClick={() => setActiveDest(i)} style={{
                width: i === activeDest ? 28 : 12, height: 4, borderRadius: 2,
                background: i === activeDest ? "var(--cream)" : "rgba(251,247,238,.35)",
                border: "none", padding: 0, transition: "all .35s ease", cursor: "pointer"
              }} />
            ))}
          </div>
        </div>

        {/* Search panel */}
        <div className="rise rise-d3" style={{
          background: "rgba(251,247,238,.96)", color: "var(--ink)",
          backdropFilter: "blur(16px)", borderRadius: 24, padding: 12,
          border: "1px solid rgba(251,247,238,.4)", boxShadow: "0 30px 80px -30px rgba(0,0,0,.6)"
        }}>
          {/* Trip type tabs */}
          <div style={{ display: "flex", gap: 4, padding: "4px 8px 12px" }}>
            {["Round trip", "One way", "Multi-city"].map((t, i) => (
              <button key={t} onClick={() => setQuery(q => ({ ...q, tripType: t }))} style={{
                background: query.tripType === t ? "var(--ink)" : "transparent",
                color: query.tripType === t ? "var(--cream)" : "var(--ink)",
                border: "none", padding: "8px 16px", borderRadius: 999,
                fontSize: 12, letterSpacing: ".06em", fontWeight: 500
              }}>{t}</button>
            ))}
            <span style={{ flex: 1 }} />
            <button style={{ background: "transparent", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: 999, fontSize: 12, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon.user size={13} /> 1 adult, Economy
            </button>
          </div>

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr auto 1.2fr 1fr 1fr auto", gap: 0, alignItems: "stretch", border: "1px solid var(--line)", borderRadius: 16, overflow: "visible", background: "white", position: "relative" }}>
            <Field
              label="From"
              value={`${query.origin.city} (${query.origin.code})`}
              sub={query.origin.name}
              icon={<Icon.pin size={14} />}
              onClick={() => { setOriginOpen(o => !o); setDestOpen(false); }}
              open={originOpen}
            >
              {originOpen && (
                <AirportPicker
                  onPick={(a) => { setQuery(q => ({ ...q, origin: a })); setOriginOpen(false); }}
                  exclude={query.dest.code}
                />
              )}
            </Field>

            <button onClick={() => setQuery(q => ({ ...q, origin: q.dest, dest: q.origin }))} style={{
              border: "none", background: "transparent", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)",
              padding: "0 12px", color: "var(--ink-3)"
            }}>
              <Icon.swap size={16} />
            </button>

            <Field
              label="To"
              value={`${query.dest.city} (${query.dest.code})`}
              sub={query.dest.name}
              icon={<Icon.pin size={14} />}
              onClick={() => { setDestOpen(o => !o); setOriginOpen(false); }}
              open={destOpen}
            >
              {destOpen && (
                <AirportPicker
                  onPick={(a) => { setQuery(q => ({ ...q, dest: a })); setDestOpen(false); }}
                  exclude={query.origin.code}
                />
              )}
            </Field>

            <Field label="Depart" value={query.departLabel} sub={query.departWeek} icon={<Icon.cal size={14} />} />
            <Field label="Return" value={query.returnLabel} sub={query.returnWeek} icon={<Icon.cal size={14} />} />

            <button onClick={onSearch} style={{
              background: "var(--ink)", color: "var(--cream)", border: "none",
              borderRadius: "0 16px 16px 0", padding: "0 28px",
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 14, letterSpacing: ".06em", fontWeight: 500
            }}>
              <Icon.search size={16} />
              Search flights
            </button>
          </div>

          {/* Quick filter chips */}
          <div style={{ display: "flex", gap: 8, padding: "12px 6px 4px", flexWrap: "wrap" }}>
            {["Direct only", "Daytime departures", "Window seat", "Carbon-light routes", "+ Use 12,400 miles"].map((c, i) => (
              <button key={c} style={{
                background: i === 4 ? "var(--ink)" : "transparent",
                color: i === 4 ? "var(--cream)" : "var(--ink-3)",
                border: i === 4 ? "1px solid var(--ink)" : "1px solid var(--line)",
                padding: "7px 14px", borderRadius: 999, fontSize: 12,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Bottom row: featured destinations */}
        <div className="rise rise-d4" style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>This week — corridor pricing</div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>← drag →</div>
          </div>
          <div className="no-scrollbar" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {DESTINATIONS.map((d, i) => (
              <button key={d.code} onClick={() => setActiveDest(i)} style={{
                position: "relative", flex: "0 0 240px", height: 320, borderRadius: 18, overflow: "hidden",
                background: `url(${d.img}) center/cover`, border: "none", padding: 0, color: "var(--cream)",
                outline: i === activeDest ? "2px solid var(--cream)" : "none", outlineOffset: 4, cursor: "pointer", textAlign: "left"
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,43,0) 50%, rgba(11,26,43,.85))" }}/>
                <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}>
                  <span>{d.code}</span>
                  <span>from {fmtMoney(d.price)}</span>
                </div>
                <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                  <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>{d.city}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: .85, marginTop: 6 }}>{d.tag}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({ label, value, sub, icon, onClick, open, children }) {
  return (
    <button onClick={onClick} style={{
      position: "relative", textAlign: "left", padding: "14px 18px", border: "none",
      background: open ? "rgba(11,26,43,.04)" : "transparent",
      color: "var(--ink)", cursor: onClick ? "pointer" : "default",
      borderLeft: "1px solid var(--line)"
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .55, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--sun)" }}>{icon}</span>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 500, letterSpacing: "-.01em" }}>{value}</div>
      <div className="mono" style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{sub}</div>
      {children}
    </button>
  );
}

function AirportPicker({ onPick, exclude }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return AIRPORTS.filter(a => a.code !== exclude && (
      !ql || a.city.toLowerCase().includes(ql) || a.code.toLowerCase().includes(ql) || a.name.toLowerCase().includes(ql)
    ));
  }, [q, exclude]);
  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0, width: 360, zIndex: 30,
      background: "white", border: "1px solid var(--line)", borderRadius: 14,
      boxShadow: "0 24px 60px -20px rgba(0,0,0,.4)", overflow: "hidden"
    }}>
      <div style={{ padding: 10, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon.search size={14} />
        <input
          autoFocus
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search city or airport"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent" }}
        />
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {filtered.map(a => (
          <button key={a.code} onClick={() => onPick(a)} style={{
            width: "100%", textAlign: "left", padding: "10px 14px", border: "none",
            background: "transparent", display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
          }}>
            <span style={{ width: 30, color: "var(--ink-3)" }}><Icon.pin size={14}/></span>
            <span style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.city}</div>
              <div className="mono" style={{ fontSize: 11, opacity: .6 }}>{a.name}</div>
            </span>
            <span className="mono" style={{ fontSize: 12, letterSpacing: ".1em", opacity: .7 }}>{a.code}</span>
          </button>
        ))}
        {!filtered.length && <div style={{ padding: 18, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No airports match.</div>}
      </div>
    </div>
  );
}

window.ScreenSearch = ScreenSearch;
