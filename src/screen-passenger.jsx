// Passenger details + payment screen
const ScreenPassenger = ({ flight, query, selectedSeat, passenger, setPassenger, payment, setPayment, onContinue, onBack }) => {
  const valid = passenger.first && passenger.last && passenger.email && passenger.dob && payment.number.length >= 12 && payment.cvv.length >= 3 && payment.exp;
  const seatFee = selectedSeat ? seatPrice(selectedSeat.row, selectedSeat.col) : 0;
  const taxes = Math.round(flight.price * 0.18);
  const total = flight.price + seatFee + taxes;

  return (
    <div style={{ background: "var(--cream)", color: "var(--ink)", minHeight: "100vh", paddingTop: 130 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 40px 40px" }}>
        <div className="rise" style={{ marginBottom: 30 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .6 }}>Step 03 — Tell us who's flying</div>
          <h2 className="serif" style={{ fontSize: "clamp(50px, 7vw, 96px)", lineHeight: .95, margin: "8px 0 0", letterSpacing: "-.02em", fontWeight: 400 }}>
            Passenger <span className="italic">&amp; payment</span>.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, alignItems: "flex-start" }}>
          {/* Left: forms */}
          <div className="rise rise-d1" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Card title="Lead passenger" badge="01">
              <Row>
                <Input label="First name" value={passenger.first} onChange={v => setPassenger({ ...passenger, first: v })} placeholder="Iris"/>
                <Input label="Last name"  value={passenger.last}  onChange={v => setPassenger({ ...passenger, last: v })}  placeholder="Whittaker"/>
              </Row>
              <Row>
                <Input label="Date of birth"  value={passenger.dob}  onChange={v => setPassenger({ ...passenger, dob: v })}  placeholder="1992-04-18" mono/>
                <Input label="Nationality"    value={passenger.nat}  onChange={v => setPassenger({ ...passenger, nat: v })}  placeholder="United States"/>
              </Row>
              <Row>
                <Input label="Email" value={passenger.email} onChange={v => setPassenger({ ...passenger, email: v })} placeholder="iris@example.com"/>
                <Input label="Phone" value={passenger.phone} onChange={v => setPassenger({ ...passenger, phone: v })} placeholder="+1 (415) 555 0142" mono/>
              </Row>
              <Row>
                <Input label="Passport number" value={passenger.passport} onChange={v => setPassenger({ ...passenger, passport: v })} placeholder="A1234567" mono/>
                <Input label="Frequent flyer #" value={passenger.ff} onChange={v => setPassenger({ ...passenger, ff: v })} placeholder="optional" mono/>
              </Row>
            </Card>

            <Card title="Add-ons" badge="02">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { id: "bag", label: "Checked bag", sub: "23 kg · $40", price: 40, icon: <Icon.bag size={16}/> },
                  { id: "wifi", label: "In-flight Wi-Fi", sub: "Stream-grade · $18", price: 18, icon: <Icon.wifi size={16}/> },
                  { id: "meal", label: "Hot meal", sub: "Chef-curated · $24", price: 24, icon: <Icon.meal size={16}/> },
                  { id: "carbon", label: "Carbon offset", sub: "Forest restoration · $12", price: 12, icon: <Icon.leaf size={16}/> },
                ].map(a => {
                  const on = passenger.addons.includes(a.id);
                  return (
                    <button key={a.id} onClick={() => setPassenger({
                      ...passenger,
                      addons: on ? passenger.addons.filter(x => x !== a.id) : [...passenger.addons, a.id]
                    })} style={{
                      textAlign: "left", padding: 14, borderRadius: 14,
                      border: "1px solid", borderColor: on ? "var(--ink)" : "var(--line)",
                      background: on ? "var(--ink)" : "white", color: on ? "var(--cream)" : "var(--ink)",
                      display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer"
                    }}>
                      <span style={{ marginTop: 2, color: on ? "var(--sun)" : "var(--ink-3)" }}>{a.icon}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</span>
                        <span style={{ display: "block", fontSize: 11, fontFamily: "var(--mono)", opacity: .7, marginTop: 2 }}>{a.sub}</span>
                      </span>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4, border: "1.4px solid currentColor",
                        background: on ? "var(--sun)" : "transparent", display: "inline-grid", placeItems: "center"
                      }}>
                        {on && <Icon.check size={11} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Payment" badge="03">
              {/* Card visual */}
              <div style={{
                background: "linear-gradient(135deg, #14283f, #0b1a2b 60%, #1f3a5a)",
                color: "var(--cream)", borderRadius: 18, padding: 24, position: "relative", overflow: "hidden",
                marginBottom: 18, height: 200
              }}>
                {/* shimmer */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 0%, rgba(227,107,58,.5), transparent 60%)" }}/>
                <div style={{ position: "absolute", left: 0, right: 0, top: "60%", height: 1, background: "rgba(251,247,238,.15)" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="serif italic" style={{ fontSize: 22, opacity: .9 }}>aeria</div>
                  <Icon.cardChip size={26} />
                </div>
                <div className="mono" style={{ position: "absolute", left: 24, bottom: 50, fontSize: 22, letterSpacing: ".18em" }}>
                  {(payment.number || "•••• •••• •••• ••••").replace(/(.{4})/g, "$1 ").trim()}
                </div>
                <div style={{ position: "absolute", left: 24, right: 24, bottom: 18, display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, opacity: .85, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  <span>{payment.name || `${passenger.first || "Cardholder"} ${passenger.last || "name"}`}</span>
                  <span>{payment.exp || "MM / YY"}</span>
                </div>
              </div>

              <Row>
                <Input label="Card number" value={payment.number} onChange={v => setPayment({ ...payment, number: v.replace(/\D/g, "").slice(0, 16) })} placeholder="4242 4242 4242 4242" mono/>
              </Row>
              <Row>
                <Input label="Expiry" value={payment.exp} onChange={v => setPayment({ ...payment, exp: v })} placeholder="07 / 28" mono/>
                <Input label="CVV"    value={payment.cvv} onChange={v => setPayment({ ...payment, cvv: v.replace(/\D/g, "").slice(0,4) })} placeholder="•••" mono/>
                <Input label="ZIP"    value={payment.zip} onChange={v => setPayment({ ...payment, zip: v })} placeholder="94110" mono/>
              </Row>
            </Card>
          </div>

          {/* Right: itinerary summary */}
          <aside className="rise rise-d2" style={{ position: "sticky", top: 130 }}>
            <div style={{
              background: "white", border: "1px solid var(--line)", borderRadius: 22, padding: 26,
              position: "relative", overflow: "hidden"
            }}>
              {/* perforation strip across middle */}
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55 }}>Itinerary</div>
              <div style={{ marginTop: 14, marginBottom: 8 }}>
                <FlightLine flight={flight} originCity={query.origin.city} destCity={query.dest.city} date={query.departLabel} />
              </div>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: .7, marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                <span>{query.departLabel}</span>
                <span>{flight.aircraft}</span>
                <span>{flight.cabin} preferred</span>
              </div>

              {/* Seat */}
              <div style={{ marginTop: 18, padding: 14, background: "var(--paper)", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .6 }}>Your seat</div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1, marginTop: 4 }}>
                    {selectedSeat ? <>{selectedSeat.row}<span style={{ color: "var(--sun)" }}>{selectedSeat.col}</span></> : "—"}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 11, opacity: .65, textAlign: "right", lineHeight: 1.6 }}>
                  Row {selectedSeat?.row || "—"}<br/>
                  {selectedSeat ? seatTier(selectedSeat.row, selectedSeat.col) : ""}
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ marginTop: 22, fontSize: 13 }}>
                <PriceLine label="Flight base" value={fmtMoney(flight.price)} />
                <PriceLine label={`Seat ${selectedSeat ? selectedSeat.row + selectedSeat.col : ""}`} value={fmtMoney(seatFee)} />
                {passenger.addons.length > 0 && passenger.addons.map(id => {
                  const map = { bag: ["Checked bag", 40], wifi: ["Wi-Fi", 18], meal: ["Hot meal", 24], carbon: ["Carbon offset", 12] };
                  return <PriceLine key={id} label={map[id][0]} value={fmtMoney(map[id][1])} />;
                })}
                <PriceLine label="Taxes &amp; fees" value={fmtMoney(taxes)} />
              </div>

              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: .6 }}>Total today</span>
                <span className="serif" style={{ fontSize: 44, lineHeight: 1 }}>{fmtMoney(total + passenger.addons.reduce((s, id) => s + ({bag:40,wifi:18,meal:24,carbon:12}[id] || 0), 0))}</span>
              </div>

              <div className="mono" style={{ fontSize: 10, opacity: .55, marginTop: 10, lineHeight: 1.5 }}>
                Free cancellation within 24h · Price-lock for 30 minutes from selection.
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ActionBar
        secondary="Back"
        onSecondary={onBack}
        primary={valid ? "Confirm &amp; pay" : "Fill required fields"}
        onPrimary={onContinue}
        primaryDisabled={!valid}
      />
    </div>
  );
};

function Card({ title, badge, children }) {
  return (
    <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 22, padding: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span className="mono" style={{ width: 28, height: 28, display: "inline-grid", placeItems: "center", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11 }}>{badge}</span>
        <h3 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 400 }}>{title}</h3>
      </header>
      {children}
    </section>
  );
}
function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 12, marginBottom: 12 }}>{children}</div>;
}
function Input({ label, value, onChange, placeholder, mono }) {
  return (
    <label style={{ display: "block" }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", opacity: .55, marginBottom: 6 }}>{label}</div>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12,
          fontSize: 15, fontFamily: mono ? "var(--mono)" : "inherit", background: "var(--cream)", outline: "none"
        }}
      />
    </label>
  );
}
function PriceLine({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "var(--ink-3)" }}>
      <span dangerouslySetInnerHTML={{ __html: label }} />
      <span className="mono">{value}</span>
    </div>
  );
}

window.ScreenPassenger = ScreenPassenger;
