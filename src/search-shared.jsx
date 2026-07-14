// Shared glassmorphic search primitives for the Hotels + Cars panels.
// Styled from ui-tokens.json / index.html :root — no new design system. Attaches to window.
// Loaded BEFORE screen-search-hotels.jsx and screen-search-cars.jsx.

// ---- frosted field (matches the flight Field look, with a mode accent) ------
function GlassField({ label, icon, accent = "var(--sun)", value, sub, onClick, open, children }) {
  return (
    <div style={{ position: "relative", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
      <button onClick={onClick} style={{
        width: "100%", height: "100%", textAlign: "left", padding: "14px 18px", border: "none",
        background: open ? "rgba(255,255,255,.18)" : "transparent", color: "var(--cream)",
        cursor: onClick ? "pointer" : "default", transition: "background .25s ease" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .75, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: accent }}>{icon}</span>{label}
        </div>
        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 500, letterSpacing: "-.01em" }}>{value}</div>
        {sub && <div className="mono" style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{sub}</div>}
      </button>
      {children}
    </div>
  );
}

// ---- date field (native input, frosted) -------------------------------------
function GlassDateField({ label, value, onChange, accent = "var(--sun)" }) {
  return (
    <div style={{ borderLeft: "1px solid rgba(255,255,255,.18)", padding: "14px 18px", color: "var(--cream)" }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .75, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: accent }}><Icon.cal size={14} /></span>{label}
      </div>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} style={{
        marginTop: 4, fontSize: 16, fontWeight: 500, background: "transparent", border: "none", outline: "none",
        color: "var(--cream)", colorScheme: "dark", width: "100%", padding: 0 }} />
    </div>
  );
}

// ---- searchable picker dropdown --------------------------------------------
function GlassPicker({ items, onPick, placeholder = "Search" }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter(a => !ql || (a.city || "").toLowerCase().includes(ql) || (a.code || "").toLowerCase().includes(ql) || (a.country || "").toLowerCase().includes(ql));
  }, [q, items]);
  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      position: "absolute", top: "calc(100% + 8px)", left: 0, width: 360, zIndex: 30,
      background: "linear-gradient(180deg, rgba(20,40,63,.82), rgba(11,26,43,.82))",
      border: "1px solid rgba(255,255,255,.22)", borderRadius: 16,
      backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)",
      boxShadow: "0 30px 70px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.18)", overflow: "hidden", color: "var(--cream)" }}>
      <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,.14)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon.search size={14} />
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: "var(--cream)" }} />
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {filtered.map(a => (
          <button key={a.code} onClick={() => onPick(a)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", color: "var(--cream)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 26, opacity: .7 }}><Icon.pin size={14} /></span>
            <span style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{a.city}</div>
              <div className="mono" style={{ fontSize: 11, opacity: .65 }}>{a.country}</div>
            </span>
            <span className="mono" style={{ fontSize: 12, letterSpacing: ".1em", opacity: .75 }}>{a.code}</span>
          </button>
        ))}
        {!filtered.length && <div style={{ padding: 18, textAlign: "center", opacity: .65, fontSize: 13 }}>No matches.</div>}
      </div>
    </div>
  );
}

// ---- stepper field (guests / rooms / driver age) ----------------------------
function GlassStepperField({ label, summary, steppers, accent = "var(--sun)" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", height: "100%", textAlign: "left", padding: "14px 18px", border: "none", background: open ? "rgba(255,255,255,.18)" : "transparent", color: "var(--cream)", cursor: "pointer" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: .75, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: accent }}><Icon.user size={14} /></span>{label}
        </div>
        <div style={{ marginTop: 4, fontSize: 16, fontWeight: 500 }}>{summary}</div>
      </button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 260, zIndex: 30,
          background: "linear-gradient(180deg, rgba(20,40,63,.82), rgba(11,26,43,.82))", border: "1px solid rgba(255,255,255,.22)", borderRadius: 16,
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", padding: 8, color: "var(--cream)", boxShadow: "0 30px 70px -20px rgba(0,0,0,.6)" }}>
          {steppers.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
              <span style={{ fontSize: 14 }}>{s.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StepBtn onClick={() => s.set(Math.max(s.min, s.value - 1))} disabled={s.value <= s.min}>−</StepBtn>
                <span className="mono" style={{ minWidth: 18, textAlign: "center" }}>{s.value}</span>
                <StepBtn onClick={() => s.set(Math.min(s.max, s.value + 1))} disabled={s.value >= s.max}>+</StepBtn>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StepBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 28, height: 28, borderRadius: 999, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.08)", color: "var(--cream)", fontSize: 16, lineHeight: 1, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .4 : 1 }}>{children}</button>
  );
}

// ---- results overlay (full-screen, cream) -----------------------------------
function ResultsOverlay({ title, onClose, loading, count, accent = "var(--sun)", children }) {
  // Portal to <body> so the glass panel's backdrop-filter doesn't trap position:fixed.
  return ReactDOM.createPortal((
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--cream)", color: "var(--ink)", overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(251,247,238,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: accent }}>{loading ? "Searching" : `${count} result${count === 1 ? "" : "s"}`}</div>
          <div className="serif" style={{ fontSize: 32, lineHeight: 1, marginTop: 2 }}>{title}</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 999, padding: "10px 18px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink)" }}>
          <Icon.back size={14} /> Back to search
        </button>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px" }}>
        {loading ? (
          <div style={{ display: "grid", placeItems: "center", padding: "80px 0", opacity: .7 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: "var(--mono)", letterSpacing: ".2em", textTransform: "uppercase", fontSize: 13 }}>
              <span className="spinner" /> Finding the best options
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>{children}</div>
        )}
      </div>
    </div>
  ), document.body);
}

function EmptyState({ text }) {
  return <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", opacity: .6, fontSize: 15 }}>{text}</div>;
}

function Stars({ n = 0 }) {
  return <span style={{ color: "var(--sun)", display: "inline-flex", gap: 1 }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ opacity: i < n ? 1 : .22 }}><Icon.star size={12} /></span>)}</span>;
}

// ---- hotel result card ------------------------------------------------------
function StayCard({ stay, onReserve }) {
  const a = stay.accommodation || {};
  const price = Math.round(parseFloat(stay.cheapestRateTotalAmount || "0"));
  const photo = a.photos?.[0]?.url;
  const addr = a.location?.address;
  return (
    <div className="dest-card" style={{ border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 170, background: photo ? `url(${photo}) center/cover` : "var(--paper-2)" }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div className="serif" style={{ fontSize: 21, lineHeight: 1.05 }}>{a.name}</div>
          {a.rating ? <Stars n={a.rating} /> : null}
        </div>
        {addr && <div className="mono" style={{ fontSize: 11, opacity: .6, letterSpacing: ".04em" }}>{[addr.lineOne, addr.city].filter(Boolean).join(", ")}</div>}
        {a.reviewScore ? <div className="mono" style={{ fontSize: 11, opacity: .75 }}>★ {a.reviewScore} guest score</div> : null}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
          <div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{fmtMoney(price)}</div>
            <div className="mono" style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: ".14em" }}>total{stay._mock ? " · demo" : ""}</div>
          </div>
          <button onClick={onReserve} className="lift" style={{ background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 999, padding: "11px 18px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}>
            Reserve <Icon.arrow size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- car result card --------------------------------------------------------
function CarCard({ car, onReserve }) {
  const price = Math.round(parseFloat(car.totalAmount || "0"));
  return (
    <div className="dest-card" style={{ border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 150, background: car.imageUrl ? `url(${car.imageUrl}) center/cover` : "var(--paper-2)", position: "relative" }}>
        <span className="mono" style={{ position: "absolute", top: 10, left: 10, background: "rgba(11,26,43,.8)", color: "var(--cream)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 999 }}>{car.vehicleClass}</span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div className="serif" style={{ fontSize: 21, lineHeight: 1.05 }}>{car.vehicleName}</div>
        <div className="mono" style={{ fontSize: 11, opacity: .65, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>{car.transmission}</span><span>· {car.seats} seats</span><span>· {car.bags} bags</span>
        </div>
        <div className="mono" style={{ fontSize: 11, opacity: .55 }}>{car.vendor}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
          <div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{fmtMoney(price)}</div>
            <div className="mono" style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: ".14em" }}>total{car._mock ? " · demo" : ""}</div>
          </div>
          <button onClick={onReserve} className="lift" style={{ background: "var(--grass)", color: "var(--cream)", border: "none", borderRadius: 999, padding: "11px 18px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}>
            Reserve <Icon.arrow size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- booking overlay (guest form → confirmation) ----------------------------
function BookingOverlay({ kind, title, priceLabel, onClose, onConfirm }) {
  const [guest, setGuest] = useState({ first: "", last: "", email: "", phone: "" });
  const [state, setState] = useState("form"); // form | working | done
  const [conf, setConf] = useState(null);
  const valid = guest.first && guest.last && guest.email;
  async function confirm() {
    setState("working");
    try { const r = await onConfirm(guest); setConf(r); setState("done"); }
    catch (e) { setConf({ error: e.message }); setState("done"); }
  }
  return ReactDOM.createPortal((
    <div style={{ position: "fixed", inset: 0, zIndex: 240, background: "rgba(11,26,43,.55)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 100%)", background: "var(--cream)", color: "var(--ink)", borderRadius: 22, overflow: "hidden", boxShadow: "0 40px 90px -30px rgba(0,0,0,.6)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", opacity: .6 }}>{kind === "hotel" ? "Confirm stay" : "Confirm rental"}</div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, marginTop: 2 }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 22, lineHeight: 1, cursor: "pointer", color: "var(--ink-3)" }}>×</button>
        </div>

        {state === "done" ? (
          <div style={{ padding: 28, textAlign: "center" }}>
            {conf?.error ? (
              <>
                <div className="serif" style={{ fontSize: 28 }}>Couldn’t complete booking</div>
                <div className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 8 }}>{conf.error}</div>
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--grass)", color: "var(--cream)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon.check size={26} /></div>
                <div className="serif" style={{ fontSize: 30 }}>Booked{conf?._mock ? " (demo)" : ""}</div>
                <div className="mono" style={{ fontSize: 12, opacity: .7, marginTop: 8 }}>Reference {conf?.reference}</div>
                <div style={{ fontSize: 14, opacity: .8, marginTop: 10 }}>A confirmation was sent to {guest.email}.</div>
              </>
            )}
            <button onClick={onClose} style={{ marginTop: 22, background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 14 }}>Done</button>
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <BField label="First name" value={guest.first} onChange={v => setGuest(g => ({ ...g, first: v }))} />
              <BField label="Last name" value={guest.last} onChange={v => setGuest(g => ({ ...g, last: v }))} />
              <BField label="Email" value={guest.email} onChange={v => setGuest(g => ({ ...g, email: v }))} span2 type="email" />
              <BField label="Phone" value={guest.phone} onChange={v => setGuest(g => ({ ...g, phone: v }))} span2 type="tel" />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
              <div className="serif" style={{ fontSize: 24 }}>{priceLabel}</div>
              <button onClick={confirm} disabled={!valid || state === "working"} style={{ background: valid ? "var(--ink)" : "var(--ink-3)", color: "var(--cream)", border: "none", borderRadius: 999, padding: "14px 26px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 10, opacity: valid ? 1 : .5, cursor: valid ? "pointer" : "not-allowed" }}>
                {state === "working" ? <><span className="spinner" /> Booking…</> : <>Confirm & book <Icon.arrow size={14} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ), document.body);
}
function BField({ label, value, onChange, span2, type = "text" }) {
  return (
    <label style={{ gridColumn: span2 ? "1 / -1" : "auto", display: "block" }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", opacity: .6, marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--paper)", fontSize: 15, outline: "none", color: "var(--ink)" }} />
    </label>
  );
}

Object.assign(window, { GlassField, GlassDateField, GlassPicker, GlassStepperField, ResultsOverlay, EmptyState, StayCard, CarCard, BookingOverlay });
