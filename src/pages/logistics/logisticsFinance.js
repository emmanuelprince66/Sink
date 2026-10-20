// Maps the backend's audited `financial_breakdown` (per delivery) and
// `metrics.financials` (overview totals). Deliberately no fallback to the
// legacy `amount` / `commission` keys — the backend is retiring them.

const num = (v) => Number(v ?? 0) || 0;

export const PAYMENT_METHOD_LABEL = {
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  BNPL: "BNPL",
  CASH: "Cash",
};

export const DELIVERY_TYPE_LABEL = {
  SHIPBUBBLE: "Shipbubble",
  "IN-HOUSE": "In-House",
  PICKUP: "Pickup",
};

export const mapFinance = (item) => {
  const fb = item?.financial_breakdown || {};
  const d = fb.details || {};
  return {
    customerPaid: num(fb.customer_paid),
    businessReceived: num(fb.business_received),
    shipbubbleCost: num(fb.shipbubble_cost),
    sync360Retained: num(fb.sync360_retained),
    paymentMethod: d.payment_method || "",
    deliveryType: d.delivery_type || "",
    merchandiseAmount: num(d.merchandise_amount),
    customerShippingFee: num(d.customer_shipping_fee),
    paymentGatewayCharge: num(d.payment_gateway_charge),
    bnplPlatformFee: num(d.bnpl_platform_fee),
    shippingMargin: num(d.sync360_shipping_margin),
    gatewayMargin: num(d.sync360_gateway_margin),
  };
};

// Prefer backend totals; fall back to summing the loaded rows (first page only).
export const mapFinancialTotals = (overviewData, rows = []) => {
  const f = overviewData?.metrics?.financials || {};
  const sum = (key) => rows.reduce((acc, r) => acc + (r.finance?.[key] || 0), 0);
  return {
    customerPaid: f.total_customer_paid ?? sum("customerPaid"),
    paidToMerchants: f.total_paid_to_merchants ?? sum("businessReceived"),
    paidToShipbubble: f.total_paid_to_shipbubble ?? sum("shipbubbleCost"),
    sync360Retained: f.total_sync360_retained ?? sum("sync360Retained"),
  };
};
