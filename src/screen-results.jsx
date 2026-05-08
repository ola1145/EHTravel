// Results screen — rich filterable list of flights
const ScreenResults = ({ query, flights, selected, onSelect, onContinue, onBack }) => {
  const [sort, setSort] = useState("best");
  const [stopsFilter, setStopsFilter] = useState("any");
  const [maxPrice, setMaxPrice] = useState(1500);

  const filtered = useMemo(() => {
    let arr = flights.filter(f => f.price <= maxPrice);
    if (stopsFilter === "nonstop") arr = arr.filter(f => f.stops === 0);
    if (stopsFilter === "1stop")   arr = arr.filter(f => f.stops <= 1);
    if (sort === "price")    arr = [...arr].sort((a,b) => a.price - b.price);
    if (sort === "fastest")  arr = [...arr].sort((a,b) => a.durationMin - b.durationMin);
    if (sort === "earliest") arr = [...arr].sort((a,b) => a.depMin - b.depMin);
    if (sort === "best")     arr = [...arr].sort((a,b) => (a.price/100 + a.durationMin/60 + a.stops*2) - (b.price/100 + b.durationMin/60 + b.stops*2));
    return arr;
  }, [flights, sort, stopsFilter, maxPrice]);

  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh" }}>
      {/* Header strip */}
      <header style={{
        position: "relative",
        background: `linear-gradient(180deg, rgba(11,26,43,.7), rgba(11,26,43,.85)), url(${query.dest.img || 'https://picsum.photos/seed/dest/1600/600'}) center/cover`,
        color: "var(--cream)",
        padding: "140px 40px 90px"
      }}>
        <div className="mono rise" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .8 }}>
          {filtered.length} corridors found · departing {query.departLabel}
        </div>
        <h2 className="serif rise rise-d1" style={{ fontSize: "clamp(54px, 8vw, 110px)", lineHeight: .95, margin: "12px 0 0", letterSpacing: "-.02em", fontWeight: 400 }}>
          {query.origin.city} <span className="italic" style={{ opacity: .85 }}>to</span> {query.dest.city}
        </h2>

        {/* Inline arc */}
        <div className="rise rise-d2" style={{ marginTop: 30, position: "relative", height: 70, maxWidth: 760 }}>
          <svg viewBox="0 0 600 80" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <path d="M 20 60 Q 300 -40 580 60" fill="none" stroke="var(--cream)" strokeWidth="1" strokeDasharray="2 4" opacity=".7" />
            <circle cx="20" cy="60" r="5" fill="var(--cream)" />
            <circle cx="580" cy="60" r="5" fill="var(--sun)" />
            <g transform="translate(295, 8)" style={{ color: "var(--sun)" }}>
              <g transform="translate(-12,-12) rotate(95 12 12)"><Icon.plane size={24}/></g>
            </g>
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: -8 }}>
            <div>
              <div className="serif" style={{ fontSize: 30 }}>{query.origin.code}</div>
              <div className="mono" style={{ fontSize: 11, opacity: .8 }}>{query.origin.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="serif" style={{ fontSize: 30 }}>{query.dest.code}</div>
              <div className="mono" style={{ fontSize: 11, opacity: .8 }}>{query.dest.name}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, padding: "40px 40px 60px", maxWidth: 1480, margin: "0 auto" }}>
        {/* Filter rail */}
        <aside>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55, marginBottom: 14 }}>Refine</div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, marginBottom: 10, fontWeight: 500 }}>Stops</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["any",     "Any"],
                ["nonstop", "Nonstop only"],
                ["1stop",   "Up to 1 stop"]
              ].map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 999, border: "1px solid var(--ink-3)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {stopsFilter === k && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ink)" }} />}
                  </span>
                  <input type="radio" checked={stopsFilter === k} onChange={() => setStopsFilter(k)} style={{ display: "none" }} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, marginBottom: 10, fontWeight: 500, display: "flex", justifyContent: "space-between" }}>
              <span>Max price</span>
              <span className="mono" style={{ fontSize: 12 }}>{fmtMoney(maxPrice)}</span>
            </div>
            <input type="range" min="280" max="1500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--sun)" }} />
            <div className="mono" style={{ fontSize: 10, opacity: .6, display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span>$280</span><span>$1,500</span>
            </div>
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, marginBottom: 10, fontWeight: 500 }}>Carriers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CARRIERS.map(c => (
                <label key={c.code} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ width: 14, height: 14, border: "1px solid var(--ink-3)", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--ink)", color: "var(--cream)" }}>
                    <Icon.check size={10} />
                  </span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span className="mono" style={{ fontSize: 11, opacity: .55 }}>{c.code}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, marginBottom: 10, fontWeight: 500 }}>Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Wi-Fi", "Lie-flat", "Hot meal", "USB-C", "Lounge"].map(a => (
                <span key={a} style={{ padding: "5px 10px", border: "1px solid var(--line)", borderRadius: 999, fontSize: 11 }}>{a}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Results column */}
        <div>
          {/* Sort row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55, marginRight: 8 }}>Sort</span>
              {[
                ["best", "Best"],
                ["price", "Cheapest"],
                ["fastest", "Fastest"],
                ["earliest", "Earliest"]
              ].map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)} style={{
                  background: sort === k ? "var(--ink)" : "transparent",
                  color: sort === k ? "var(--cream)" : "var(--ink-3)",
                  border: sort === k ? "1px solid var(--ink)" : "1px solid var(--line)",
                  padding: "6px 12px", borderRadius: 999, fontSize: 12
                }}>{l}</button>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", opacity: .65 }}>
              {filtered.length} of {flights.length} flights
            </div>
          </div>

          {/* Flight cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((f, i) => {
              const isSel = selected?.id === f.id;
              return (
                <article key={f.id} onClick={() => onSelect(f)} className={`rise rise-d${Math.min(i+1, 5)}`} style={{
                  background: "white", border: "1px solid", borderColor: isSel ? "var(--ink)" : "var(--line)",
                  borderRadius: 18, padding: 22, cursor: "pointer",
                  transition: "all .2s ease",
                  boxShadow: isSel ? "0 12px 30px -12px rgba(11,26,43,.35)" : "0 1px 0 rgba(11,26,43,.02)",
                  position: "relative", overflow: "hidden"
                }}>
                  {isSel && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--sun)" }} />}
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 28, alignItems: "center" }}>
                    {/* Carrier */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: f.carrier.accent,
                        color: "var(--cream)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-.02em"
                      }}>{f.carrier.code}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{f.carrier.name}</div>
                        <div className="mono" style={{ fontSize: 11, opacity: .55 }}>Flight {f.id}</div>
                      </div>
                    </div>

                    {/* Route */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ minWidth: 70 }}>
                        <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>{fmtTime(f.depMin)}</div>
                        <div className="mono" style={{ fontSize: 11, opacity: .6, marginTop: 4 }}>{f.origin}</div>
                      </div>
                      <div style={{ flex: 1, position: "relative", padding: "0 8px" }}>
                        <div style={{ height: 1, background: "var(--line)", position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, top: -3, width: 6, height: 6, borderRadius: 999, background: "var(--ink)" }} />
                          <span style={{ position: "absolute", right: 0, top: -3, width: 6, height: 6, borderRadius: 999, background: "var(--ink)" }} />
                          {f.stops > 0 && Array.from({ length: f.stops }).map((_, k) => (
                            <span key={k} style={{
                              position: "absolute", left: `${((k+1)/(f.stops+1))*100}%`, top: -3,
                              width: 6, height: 6, borderRadius: 999, background: "var(--sun)"
                            }} />
                          ))}
                        </div>
                        <div className="mono" style={{ textAlign: "center", fontSize: 11, opacity: .65, marginTop: 6, letterSpacing: ".1em", textTransform: "uppercase" }}>
                          {fmtDuration(f.durationMin)} · {f.stops === 0 ? "Nonstop" : `${f.stops} stop`}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 70 }}>
                        <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>{fmtTime(f.arrMin)}</div>
                        <div className="mono" style={{ fontSize: 11, opacity: .6, marginTop: 4 }}>{f.dest}</div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div style={{ display: "flex", gap: 12, color: "var(--ink-3)" }}>
                      <span title="Wi-Fi"><Icon.wifi size={16} /></span>
                      <span title="Meal"><Icon.meal size={16} /></span>
                      <span title="Bag"><Icon.bag size={16} /></span>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .55 }}>From</div>
                      <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>{fmtMoney(f.price)}</div>
                      <div className="mono" style={{ fontSize: 10, opacity: .55, marginTop: 4 }}>per person, all-in</div>
                    </div>
                  </div>

                  {/* Sub strip */}
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: ".06em" }}>
                    <span>{f.aircraft}</span>
                    <span style={{ opacity: .35 }}>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.leaf size={12}/> {f.co2} kg CO₂e</span>
                    <span style={{ opacity: .35 }}>·</span>
                    <span>{f.cabin} preferred</span>
                    <span style={{ flex: 1 }}/>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sun-deep)" }}>
                      {isSel ? <><Icon.check size={12}/> Selected</> : <>Choose flight <Icon.arrow size={12}/></>}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <ActionBar
        left={selected ? <>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>Selected</div>
            <div style={{ fontWeight: 500 }}>{selected.carrier.name} {selected.id} · {fmtTime(selected.depMin)} {selected.origin} → {fmtTime(selected.arrMin)} {selected.dest}</div>
          </div>
        </> : <span className="mono" style={{ opacity: .55, fontSize: 12 }}>Pick a flight to continue</span>}
        right={selected && <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 10, opacity: .55, letterSpacing: ".18em", textTransform: "uppercase" }}>Subtotal</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1 }}>{fmtMoney(selected.price)}</div>
        </div>}
        secondary="Back"
        onSecondary={onBack}
        primary="Choose seat"
        onPrimary={onContinue}
        primaryDisabled={!selected}
      />
    </div>
  );
};

window.ScreenResults = ScreenResults;
