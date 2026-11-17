import {
  DEFAULT_VAT_RATE,
  roundToTwoDecimals,
  type CalculatedItem,
  type CalculatedQuotationTotals,
  type QuotationItemInput,
  calculateLineItem,
  calculateQuotationTotals,
  UNIT_OPTIONS,
} from "@/lib/quotations/calculations";
import { PREEDHAR_COMPANY_DETAILS } from "@/lib/invoices/calculations";

export {
  DEFAULT_VAT_RATE,
  roundToTwoDecimals,
  calculateLineItem,
  calculateQuotationTotals,
  UNIT_OPTIONS,
  PREEDHAR_COMPANY_DETAILS,
  type CalculatedItem,
  type CalculatedQuotationTotals,
  type QuotationItemInput,
};

export type PurchaseOrderStatus = string;

export function calculateDeliveryDate(poDateStr: string, daysToAdd: number = 14): string {
  if (!poDateStr) return "";
  const date = new Date(poDateStr);
  if (isNaN(date.getTime())) return poDateStr;
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

export const DEFAULT_PURCHASE_ORDER_TERMS = `1. Delivery Location: As specified in the Project / Site Location of this Purchase Order.
2. Delivery Schedule: Materials and equipment must be delivered strictly on or before the Expected Delivery Date.
3. Quality Standards: All supplied items must be brand new, unblemished, and comply with UAE safety and DEWA/DCD standards.
4. Documentation: A valid Delivery Advice Note (DN) and Original Tax Invoice must accompany each delivery shipment.
5. Inspection & Acceptance: Goods are subject to site technical inspection and approval by the PREEDHAR Project Engineer prior to formal acceptance.
6. Payment Terms: Payment will be processed within 30 days following satisfactory receipt, testing, and approval of goods.`;
