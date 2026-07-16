// Hero search screen - cinematic landing with destination cards
const ScreenSearch = ({ onSearch, query, setQuery }) => {
  const [activeDest, setActiveDest] = useState(0);
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [parallaxX, setParallaxX] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const [mode, setMode] = useState("flights"); // flights | hotels | cars
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
  const dropdownOpen = originOpen || destOpen;

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

      {/* Ambient color orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <span className="orb orb-a" style={{ left: "5%", top: "15%" }} />
        <span className="orb orb-b" style={{ right: "8%", top: "30%" }} />
        <span className="orb orb-c" style={{ left: "40%", bottom: "5%" }} />
      </div>

      {/* Drifting plane far behind */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "rgba(255,255,255,.18)" }}>
        <div style={{ position: "absolute", top: "22%", animation: "plane-drift 22s linear infinite", width: 90 }}>
          <Icon.plane size={56} />
        </div>
        <div style={{ position: "absolute", top: "60%", left: "60%", animation: "plane-drift 34s linear infinite", animationDelay: "-12s", width: 60, opacity: .6 }}>
          <Icon.plane size={36} />
        </div>
      </div>

      {/* Live status pill */}
      <div style={{ position: "absolute", top: 80, left: 40, zIndex: 10, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(251,247,238,.85)", padding: "6px 12px", border: "1px solid rgba(255,255,255,.22)", borderRadius: 999, background: "rgba(255,255,255,.06)", backdropFilter: "blur(10px)" }}>
        <span className="ring-pulse-wrap" style={{ display: "inline-flex" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--sun)", display: "inline-block" }} />
        </span>
        Live · 12,408 flying now
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

        {/* ── Search panel — light glassmorphic with push-content dropdown ── */}
        <div className="rise rise-d3" style={{
          position: "relative",
          background: "rgba(251,247,238,.96)",
          color: "var(--ink)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 24,
          padding: 12,
          border: "1px solid rgba(251,247,238,.4)",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.6)"
        }}>
          {/* Product mode switcher — Flights / Hotels / Cars (additive) */}
          <div style={{ display: "flex", gap: 6, padding: "6px 8px 10px" }}>
            {[
              { key: "flights", label: "Flights", accent: "var(--sun)",   accentDeep: "var(--sun-deep)" },
              { key: "hotels",  label: "Hotels",  accent: "var(--sky)",   accentDeep: "#3d6f8f" },
              { key: "cars",    label: "Cars",    accent: "var(--grass)", accentDeep: "#1e3d26" },
            ].map((m) => {
              const on = mode === m.key;
              return (
                <button key={m.key} onClick={() => setMode(m.key)} className="lift" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: on ? m.accent : "transparent",
                  color: on ? "var(--cream)" : "var(--ink-3)",
                  border: on ? `1px solid ${m.accent}` : "1px solid var(--line)",
                  padding: "9px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, letterSpacing: ".04em",
                  position: "relative"
                }}>
                  <span style={{ color: on ? "var(--cream)" : m.accent, display: "inline-flex", alignItems: "center" }}>
                    {m.key === "flights" && <Icon.plane size={15} />}
                    {m.key === "hotels" && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18V7a1 1 0 011-1h9a4 4 0 014 4v8"/><path d="M3 12h14"/><path d="M21 18v-3a2 2 0 00-2-2"/><path d="M7 10h.01"/><path d="M2 18h20"/></svg>
                    )}
                    {m.key === "cars" && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13"/><path d="M4 13h16v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"/><path d="M7 16h.01M17 16h.01"/></svg>
                    )}
                  </span>{m.label}
                </button>
              );
            })}
          </div>

          {mode === "flights" && (<>
          {/* Trip type tabs */}
          <div style={{ display: "flex", gap: 4, padding: "4px 8px 12px" }}>
            {["Round trip", "One way", "Multi-city"].map((t) => (
              <button key={t} onClick={() => setQuery(q => ({ ...q, tripType: t }))} style={{
                background: query.tripType === t ? "var(--sun)" : "transparent",
                color: query.tripType === t ? "var(--cream)" : "var(--ink-3)",
                border: query.tripType === t ? "1px solid var(--sun)" : "1px solid var(--line)",
                padding: "8px 16px", borderRadius: 999,
                fontSize: 12, letterSpacing: ".06em", fontWeight: 500
              }}>{t}</button>
            ))}
            <span style={{ flex: 1 }} />
            <button style={{
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: 999, padding: "8px 14px", fontSize: 12,
              color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 8
            }}>
              <Icon.user size={13} /> 1 adult, Economy
            </button>
          </div>

          {/* Fields — white row with sun-colored icons, ink text */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.2fr auto 1.2fr 1fr 1fr auto", gap: 0,
            alignItems: "stretch",
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 16,
            overflow: "visible",
            position: "relative"
          }}>
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
              border: "none", background: "transparent",
              borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)",
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

            <button onClick={onSearch} className="anim-pulse-sun lift" style={{
              background: "linear-gradient(135deg, var(--sun), var(--sun-deep))",
              color: "var(--cream)", border: "none",
              borderRadius: "0 16px 16px 0", padding: "0 28px",
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 14, letterSpacing: ".06em", fontWeight: 500,
              position: "relative", overflow: "hidden"
            }}>
              <Icon.search size={16} />
              Search flights
            </button>
          </div>

          {/* ── Push-content spacer (animates when dropdown is open) ── */}
          <div style={{
            height: dropdownOpen ? 352 : 0,
            transition: "height .35s cubic-bezier(.2,.8,.2,1)",
            overflow: "hidden"
          }} />

          {/* Quick filter chips */}
          <div style={{ display: "flex", gap: 8, padding: "12px 6px 4px", flexWrap: "wrap" }}>
            {["Direct only", "Daytime departures", "Window seat", "Carbon-light routes", "+ Use 12,400 miles"].map((c, i) => (
              <button key={c} className="chip-shine lift" style={{
                background: i === 4 ? "var(--sun)" : "transparent",
                color: i === 4 ? "var(--cream)" : "var(--ink-3)",
                border: i === 4 ? "1px solid var(--sun)" : "1px solid var(--line)",
                padding: "7px 14px", borderRadius: 999, fontSize: 12,
                position: "relative", overflow: "hidden"
              }}>{c}</button>
            ))}
          </div>
          </>)}

          {mode === "hotels" && <div style={{ padding: "2px 4px 6px" }}><HotelSearchPanel /></div>}
          {mode === "cars"   && <div style={{ padding: "2px 4px 6px" }}><CarSearchPanel /></div>}
        </div>

        {/* Bottom row: featured destinations */}
        <div className="rise rise-d4" style={{ marginTop: 140 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>This week — corridor pricing</div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .7 }}>← drag →</div>
          </div>
          <div className="marquee" style={{ paddingBottom: 8 }}>
            <div className="marquee-track">
              {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => {
                const realIdx = i % DESTINATIONS.length;
                return (
                <button key={i} onClick={() => setActiveDest(realIdx)} className="dest-card" style={{
                  position: "relative", flex: "0 0 240px", height: 320, borderRadius: 18, overflow: "hidden",
                  background: `url(${d.img}) center/cover`, border: "none", padding: 0, color: "var(--cream)",
                  outline: realIdx === activeDest ? "2px solid var(--cream)" : "none", outlineOffset: 4, cursor: "pointer", textAlign: "left"
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
              );})}
            </div>
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
      borderLeft: "1px solid var(--line)",
      transition: "background .25s ease"
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
      background: "white",
      border: "1px solid var(--line)",
      borderRadius: 14,
      boxShadow: "0 24px 60px -20px rgba(0,0,0,.4)",
      overflow: "hidden", color: "var(--ink)"
    }}>
      <div style={{ padding: 12, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon.search size={14} style={{ color: "var(--ink-3)" }} />
        <input
          autoFocus
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search city or airport"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: "var(--ink)" }}
        />
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {filtered.map(a => (
          <button key={a.code} onClick={() => onPick(a)} style={{
            width: "100%", textAlign: "left", padding: "10px 14px", border: "none",
            background: "transparent", color: "var(--ink)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(11,26,43,.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 30, opacity: .5 }}><Icon.pin size={14}/></span>
            <span style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.city}</div>
              <div className="mono" style={{ fontSize: 11, opacity: .6 }}>{a.name}</div>
            </span>
            <span className="mono" style={{ fontSize: 12, letterSpacing: ".1em", opacity: .5 }}>{a.code}</span>
          </button>
        ))}
        {!filtered.length && <div style={{ padding: 18, textAlign: "center", opacity: .6, fontSize: 13 }}>No airports match.</div>}
      </div>
    </div>
  );
}

window.ScreenSearch = ScreenSearch;