export class OrderError extends Error {
  constructor(message, status = 502, code = "ORDER_SERVICE_UNAVAILABLE") {
    super(message);
    this.name = "OrderError";
    this.status = status;
    this.code = code;
  }
}

function normalizeAccessEntry(value) {
  if (typeof value === "string") {
    return value.startsWith("ord_") ? { id: value } : { bookingReference: value.toUpperCase() };
  }
  if (!value || typeof value !== "object") return null;
  return {
    id: value.id ? String(value.id) : undefined,
    bookingReference: value.bookingReference ? String(value.bookingReference).toUpperCase() : undefined,
  };
}

function claimValues(claims, names) {
  return names.flatMap((name) => {
    const value = claims?.[name];
    return Array.isArray(value) ? value : value ? [value] : [];
  });
}

function place(value) {
  if (!value) return null;
  return {
    iataCode: value.iata_code || value.iataCode || null,
    cityName: value.city_name || value.cityName || null,
    name: value.name || null,
  };
}

export function sanitizeOrder(order) {
  if (!order?.id) return null;
  const slices = Array.isArray(order.slices) ? order.slices.map((slice) => ({
    origin: place(slice.origin),
    destination: place(slice.destination),
    departingAt: slice.segments?.[0]?.departing_at || slice.segments?.[0]?.departingAt || null,
    arrivingAt: slice.segments?.at?.(-1)?.arriving_at || slice.segments?.[slice.segments.length - 1]?.arrivingAt || null,
    duration: slice.duration || null,
  })) : [];
  return {
    id: String(order.id),
    bookingReference: order.booking_reference || order.bookingReference || null,
    status: order.cancelled_at || order.cancelledAt ? "CANCELLED" : (order.status || "CONFIRMED").toUpperCase(),
    totalAmount: order.total_amount || order.totalAmount || null,
    totalCurrency: order.total_currency || order.totalCurrency || null,
    createdAt: order.created_at || order.createdAt || null,
    slices,
  };
}

export class OrderService {
  constructor(config, fetchImpl = fetch) {
    this.config = config;
    this.fetch = fetchImpl;
  }

  ownedEntries(identity) {
    if (identity.anonymous) return [];
    const configured = this.config.orderAccess?.[identity.key]
      ?? this.config.orderAccess?.[identity.tenantId]?.[identity.sub]
      ?? [];
    const entries = (Array.isArray(configured) ? configured : [configured]).map(normalizeAccessEntry).filter(Boolean);
    const ids = claimValues(identity.claims, ["order_ids", "flight_order_ids"]).map((id) => ({ id: String(id) }));
    const refs = claimValues(identity.claims, ["booking_references", "flight_booking_references"])
      .map((bookingReference) => ({ bookingReference: String(bookingReference).toUpperCase() }));
    const unique = new Map();
    for (const entry of [...entries, ...ids, ...refs]) unique.set(`${entry.id || ""}:${entry.bookingReference || ""}`, entry);
    return [...unique.values()].slice(0, 20);
  }

  async duffel(path) {
    if (!this.config.duffelToken) throw new OrderError("Live flight orders are not configured");
    const response = await this.fetch(`${this.config.duffelBaseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.config.duffelToken}`,
        "Duffel-Version": "v2",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new OrderError("Live flight orders could not be verified");
    const payload = await response.json();
    return payload?.data;
  }

  async fetchOwnedEntry(entry) {
    if (entry.id) return sanitizeOrder(await this.duffel(`/air/orders/${encodeURIComponent(entry.id)}`));
    if (entry.bookingReference) {
      const rows = await this.duffel(`/air/orders?booking_reference=${encodeURIComponent(entry.bookingReference)}&limit=1`);
      const match = Array.isArray(rows) ? rows.find((order) => String(order.booking_reference || "").toUpperCase() === entry.bookingReference) : null;
      return sanitizeOrder(match);
    }
    return null;
  }

  async list(identity, bookingReference = "") {
    if (identity.anonymous) return [];
    const wanted = String(bookingReference || "").trim().toUpperCase();
    const entries = this.ownedEntries(identity);
    let allowed = entries;
    if (wanted) {
      const exactReferences = entries.filter((entry) => entry.bookingReference === wanted);
      // Prefer a direct owned-reference mapping. If ownership is stored only by provider order ID,
      // fetching that already-owned ID and filtering its sanitized result remains authorization-safe.
      allowed = exactReferences.length
        ? exactReferences
        : entries.some((entry) => entry.bookingReference)
          ? []
          : entries.filter((entry) => entry.id);
    }
    if (wanted && !allowed.length) return [];
    const results = await Promise.allSettled(allowed.map((entry) => this.fetchOwnedEntry(entry)));
    const orders = results
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => result.value)
      .filter((order) => !wanted || String(order.bookingReference || "").toUpperCase() === wanted);
    if (!orders.length && allowed.length && results.some((result) => result.status === "rejected")) {
      const reason = results.find((result) => result.status === "rejected")?.reason;
      if (reason instanceof OrderError) throw reason;
      throw new OrderError("Live flight orders could not be verified");
    }
    return orders;
  }
}
