// Shared UI primitives and inline icons (line-art SVG, original).
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ----- Inline icon set (simple, line-art) -----
const Icon = {
  arrow: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
  ),
  back: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>
  ),
  plane: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12.5l4-1 5.5 4 2.5-.6-3-6.5L21 4l-2 8.5-7.5 8.5-1.6-5.5-5.4-2z"/></svg>
  ),
  pin: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>
  ),
  cal: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>
  ),
  user: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
  ),
  swap: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h13"/><path d="M16 3l4 4-4 4"/><path d="M17 17H4"/><path d="M8 21l-4-4 4-4"/></svg>
  ),
  search: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
  ),
  check: ({ size=16, stroke=2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L20 7"/></svg>
  ),
  filter: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M6 12h12"/><path d="M10 18h4"/></svg>
  ),
  bag: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M9 7V5a3 3 0 016 0v2"/></svg>
  ),
  wifi: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M2 9c6-5 14-5 20 0"/><path d="M5 13c4-3.5 10-3.5 14 0"/><path d="M9 17c2-1.7 4-1.7 6 0"/><circle cx="12" cy="20" r="0.5" fill="currentColor"/></svg>
  ),
  meal: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v8a3 3 0 003 3v6"/><path d="M10 4v6"/><path d="M7 4v6"/><path d="M16 4c-2 1-3 3-3 6 0 2 1 3 3 3v8"/></svg>
  ),
  leaf: ({ size=16, stroke=1.6 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 7-7 14-14"/></svg>
  ),
  star: ({ size=16, fill="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12 2l3 6.5 7 .9-5.2 4.7L18 21l-6-3.4L6 21l1.2-6.9L2 9.4l7-.9L12 2z"/></svg>
  ),
  cardChip: ({ size=18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 10h2M8 14h2M14 10h2M14 14h2"/></svg>
  ),
  qr: ({ size=120 }) => {
    // pseudo-QR: deterministic pattern, purely decorative
    const cells = [];
    const rnd = randSeed("AERIA-BP");
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      if (rnd() > .5) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
    // corner markers
    const corners = [[0,0],[14,0],[0,14]];
    return (
      <svg width={size} height={size} viewBox="0 0 21 21">
        <rect width="21" height="21" fill="#fbf7ee" />
        <g fill="#0b1a2b">{cells}</g>
        {corners.map(([cx,cy]) => (
          <g key={cx+'-'+cy} transform={`translate(${cx},${cy})`}>
            <rect width="7" height="7" fill="#fbf7ee"/>
            <rect width="7" height="7" fill="none" stroke="#0b1a2b" strokeWidth=".8"/>
            <rect x="2" y="2" width="3" height="3" fill="#0b1a2b"/>
          </g>
        ))}
      </svg>
    );
  }
};

// ----- Top nav -----
function TopNav({ stage, goto, onReset }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 28px", color: stage === "search" ? "var(--cream)" : "var(--ink)",
      pointerEvents: "none",
      mixBlendMode: stage === "search" ? "normal" : "normal",
    }}>
      <button onClick={onReset} style={{
        pointerEvents: "auto", background: "none", border: "none", padding: 0,
        display: "flex", alignItems: "center", gap: 10, color: "inherit"
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, border: "1px solid currentColor", borderRadius: 999 }}>
          <Icon.plane size={14} />
        </span>
        <span className="serif" style={{ fontSize: 24, lineHeight: 1, letterSpacing: ".02em" }}>EHTravel</span>
      </button>
      <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 28, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", opacity: .8 }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }} onClick={(e) => e.preventDefault()}>Discover</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }} onClick={(e) => e.preventDefault()}>Loyalty</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }} onClick={(e) => e.preventDefault()}>Help</a>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid currentColor", borderRadius: 999, background: "transparent", color: "inherit", cursor: "pointer", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--sun)", color: "var(--cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>IW</span> Account
        </button>
      </div>
    </nav>
  );
}

// ----- Step rail -----
function StepRail({ stage }) {
  const steps = [
    { key: "results",   label: "Choose flight" },
    { key: "seats",     label: "Seat" },
    { key: "passenger", label: "Passenger" },
    { key: "confirm",   label: "Confirm" },
  ];
  if (stage === "search") return null;
  const idx = steps.findIndex(s => s.key === stage);
  return (
    <div style={{
      position: "fixed", top: 64, left: 0, right: 0, zIndex: 40,
      display: "flex", justifyContent: "center", padding: "10px 0",
      pointerEvents: "none"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "rgba(251,247,238,.85)", backdropFilter: "blur(10px)",
        border: "1px solid var(--line)", borderRadius: 999,
        padding: "8px 14px", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase",
        pointerEvents: "auto"
      }}>
        {steps.map((s, i) => {
          const done = i < idx, active = i === idx;
          return (
            <React.Fragment key={s.key}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: active ? "var(--ink)" : (done ? "var(--ink-3)" : "rgba(11,26,43,.4)") }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: done ? "var(--ink)" : (active ? "var(--sun)" : "transparent"),
                  color: done || active ? "var(--cream)" : "currentColor",
                  border: "1px solid", borderColor: done ? "var(--ink)" : (active ? "var(--sun)" : "currentColor"),
                  fontFamily: "var(--mono)", fontSize: 10
                }}>
                  {done ? <Icon.check size={10} /> : (i + 1)}
                </span>
                {s.label}
              </span>
              {i < steps.length - 1 && <span style={{ width: 18, height: 1, background: "var(--line)" }} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ----- Booking summary "ticket" stub used in passenger + confirm -----
function FlightLine({ flight, originCity, destCity, date, big = false }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: .55 }}>{originCity}</div>
        <div className="serif" style={{ fontSize: big ? 64 : 44, lineHeight: 1 }}>{flight.origin}</div>
        <div className="mono" style={{ fontSize: 11, marginTop: 6, opacity: .7 }}>{fmtTime(flight.depMin)}</div>
      </div>
      <div style={{ flex: 1, position: "relative", paddingBottom: 14, color: "var(--ink-3)" }}>
        <div style={{ position: "relative", height: 1, background: "var(--line)", margin: "0 8px" }}>
          <span style={{ position: "absolute", left: 0, top: -3, width: 7, height: 7, borderRadius: 999, background: "var(--ink)" }} />
          <span style={{ position: "absolute", right: 0, top: -3, width: 7, height: 7, borderRadius: 999, background: "var(--ink)" }} />
          <span style={{ position: "absolute", left: "50%", top: -7, transform: "translateX(-50%) rotate(90deg)", color: "var(--sun)" }}>
            <Icon.plane size={16} />
          </span>
        </div>
        <div className="mono" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -4, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
          {fmtDuration(flight.durationMin)} · {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: .55 }}>{destCity}</div>
        <div className="serif" style={{ fontSize: big ? 64 : 44, lineHeight: 1 }}>{flight.dest}</div>
        <div className="mono" style={{ fontSize: 11, marginTop: 6, opacity: .7 }}>{fmtTime(flight.arrMin)}</div>
      </div>
    </div>
  );
}

// ----- Action bar (sticky bottom) used on multiple screens -----
function ActionBar({ left, right, primary, onPrimary, secondary, onSecondary, primaryDisabled }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 20,
      background: "linear-gradient(180deg, rgba(251,247,238,0), rgba(251,247,238,1) 35%)",
      paddingTop: 30
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--cream)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {left}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {right}
          {secondary && (
            <button onClick={onSecondary} style={{
              background: "transparent", color: "var(--ink)", border: "1px solid var(--line)",
              padding: "12px 18px", borderRadius: 999, fontSize: 13, letterSpacing: ".06em",
              display: "inline-flex", alignItems: "center", gap: 8
            }}>
              <Icon.back size={14} /> {secondary}
            </button>
          )}
          {primary && (
            <button onClick={onPrimary} disabled={primaryDisabled} style={{
              background: primaryDisabled ? "var(--ink-3)" : "var(--ink)",
              color: "var(--cream)", border: "none",
              padding: "14px 22px", borderRadius: 999, fontSize: 13, letterSpacing: ".08em",
              display: "inline-flex", alignItems: "center", gap: 10,
              opacity: primaryDisabled ? .5 : 1, cursor: primaryDisabled ? "not-allowed" : "pointer"
            }}>
              {primary} <Icon.arrow size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Faux 3D plane silhouette (top-down) used across screens -----
function PlaneSilhouette({ width = 360, opacity = 1, color = "var(--ink)" }) {
  return (
    <svg viewBox="0 0 600 200" width={width} style={{ opacity, color, display: "block" }}>
      <g fill="currentColor">
        <path d="M300,10 C320,10 340,40 345,90 L520,140 L520,160 L345,150 L342,180 L380,195 L380,200 L300,200 L220,200 L220,195 L258,180 L255,150 L80,160 L80,140 L255,90 C260,40 280,10 300,10 Z" opacity=".95"/>
      </g>
    </svg>
  );
}

Object.assign(window, { Icon, TopNav, StepRail, FlightLine, ActionBar, PlaneSilhouette });
