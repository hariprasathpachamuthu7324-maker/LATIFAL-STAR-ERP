export const DEFAULT_VAT_RATE = 5.0; // UAE Standard 5% VAT

export interface QuotationItemInput {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number; // discount amount on this line item
}

export interface CalculatedItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number; // (quantity * unitPrice) - discount
  vatAmount: number;     // taxableAmount * (vatRate / 100)
  total: number;         // taxableAmount + vatAmount
}

export interface CalculatedQuotationTotals {
  subtotal: number;       // Sum of (quantity * unitPrice)
  discount: number;       // Total discounts applied
  taxableAmount: number;  // Subtotal - discount
  vatRate: number;        // e.g. 5.0
  vatAmount: number;      // taxableAmount * (vatRate / 100)
  grandTotal: number;     // taxableAmount + vatAmount
}

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateLineItem(
  item: QuotationItemInput,
  vatRate: number = DEFAULT_VAT_RATE
): CalculatedItem {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
  const discount = Math.max(0, Math.min(quantity * unitPrice, Number(item.discount) || 0));

  const rawGross = quantity * unitPrice;
  const rawTaxable = Math.max(0, rawGross - discount);
  const rawVat = rawTaxable * (vatRate / 100);
  const rawTotal = rawTaxable + rawVat;

  return {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    description: item.description,
    quantity,
    unit: item.unit || "NOS",
    unitPrice,
    discount: roundToTwoDecimals(discount),
    taxableAmount: roundToTwoDecimals(rawTaxable),
    vatAmount: roundToTwoDecimals(rawVat),
    total: roundToTwoDecimals(rawTotal),
  };
}

export function calculateQuotationTotals(
  items: QuotationItemInput[],
  overallDiscount: number = 0,
  vatRate: number = DEFAULT_VAT_RATE
): CalculatedQuotationTotals {
  let subtotal = 0;
  let itemsDiscount = 0;

  items.forEach((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const disc = Math.max(0, Math.min(qty * price, Number(item.discount) || 0));
    subtotal += qty * price;
    itemsDiscount += disc;
  });

  const totalDiscount = itemsDiscount + Math.max(0, Number(overallDiscount) || 0);
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const vatAmount = taxableAmount * (vatRate / 100);
  const grandTotal = taxableAmount + vatAmount;

  return {
    subtotal: roundToTwoDecimals(subtotal),
    discount: roundToTwoDecimals(totalDiscount),
    taxableAmount: roundToTwoDecimals(taxableAmount),
    vatRate,
    vatAmount: roundToTwoDecimals(vatAmount),
    grandTotal: roundToTwoDecimals(grandTotal),
  };
}

export const UNIT_OPTIONS = [
  { value: "NOS", label: "NOS (Numbers / Units)" },
  { value: "LS", label: "LS (Lump Sum)" },
  { value: "HR", label: "HR (Hours)" },
  { value: "DAY", label: "DAY (Days / Shifts)" },
  { value: "M", label: "M (Linear Metres)" },
  { value: "M²", label: "M² (Square Metres)" },
  { value: "M³", label: "M³ (Cubic Metres)" },
  { value: "KG", label: "KG (Kilograms)" },
  { value: "SET", label: "SET (Complete Sets)" },
  { value: "LOT", label: "LOT (Batch / Package)" },
];

export const DEFAULT_QUOTATION_TERMS = `1. Validity: This commercial quotation is valid for 30 days from the date of issuance.
2. Payment Terms: 50% advance upon confirmation, 50% upon successful completion of work and testing.
3. Commencement: Work will commence within 3 working days following receipt of approved LPO / Advance Payment.
4. Exclusions: Civil works, authority approvals (Dubai Civil Defence / DEWA), and major structural alterations unless explicitly specified.
5. Warranty: 12 months comprehensive warranty on all replacement parts and 6 months on workmanship.`;
