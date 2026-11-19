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

export {
  DEFAULT_VAT_RATE,
  roundToTwoDecimals,
  calculateLineItem,
  calculateQuotationTotals,
  UNIT_OPTIONS,
  type CalculatedItem,
  type CalculatedQuotationTotals,
  type QuotationItemInput,
};

export type InvoiceDocumentStatus = string;
export type InvoicePaymentStatus = string;

export interface PaymentTermsOption {
  value: string;
  label: string;
  days: number;
}

export const PAYMENT_TERMS_OPTIONS: PaymentTermsOption[] = [
  { value: "Immediate / COD", label: "Immediate / Cash on Delivery", days: 0 },
  { value: "15 Days", label: "15 Days from Invoice Date", days: 15 },
  { value: "30 Days", label: "30 Days (Standard Net 30)", days: 30 },
  { value: "45 Days", label: "45 Days (Net 45)", days: 45 },
  { value: "60 Days", label: "60 Days (Net 60)", days: 60 },
  { value: "90 Days", label: "90 Days (Net 90)", days: 90 },
];

export function calculateDueDate(invoiceDateStr: string, termsValue: string): string {
  if (!invoiceDateStr) return "";
  const foundTerm = PAYMENT_TERMS_OPTIONS.find((t) => t.value === termsValue);
  const daysToAdd = foundTerm ? foundTerm.days : 30;

  const date = new Date(invoiceDateStr);
  if (isNaN(date.getTime())) return invoiceDateStr;

  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

export interface InvoiceFinancialSummary {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  amountPaid: number;
  outstandingAmount: number;
  computedPaymentStatus: InvoicePaymentStatus;
}

export function calculateInvoiceFinancials(
  items: QuotationItemInput[],
  overallDiscount: number = 0,
  amountPaid: number = 0,
  dueDateStr: string = "",
  vatRate: number = DEFAULT_VAT_RATE
): InvoiceFinancialSummary {
  const totals = calculateQuotationTotals(items, overallDiscount, vatRate);
  const sanitizedPaid = Math.max(0, Math.min(totals.grandTotal, Number(amountPaid) || 0));
  const outstanding = Math.max(0, roundToTwoDecimals(totals.grandTotal - sanitizedPaid));

  let computedPaymentStatus: InvoicePaymentStatus = "UNPAID";

  if (outstanding === 0 && totals.grandTotal > 0) {
    computedPaymentStatus = "PAID";
  } else if (sanitizedPaid > 0 && outstanding > 0) {
    computedPaymentStatus = "PARTIALLY_PAID";
  } else {
    // Check if overdue
    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(dueDate.getTime()) && dueDate < today && outstanding > 0) {
        computedPaymentStatus = "OVERDUE";
      } else {
        computedPaymentStatus = "UNPAID";
      }
    } else {
      computedPaymentStatus = "UNPAID";
    }
  }

  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    taxableAmount: totals.taxableAmount,
    vatRate: totals.vatRate,
    vatAmount: totals.vatAmount,
    grandTotal: totals.grandTotal,
    amountPaid: roundToTwoDecimals(sanitizedPaid),
    outstandingAmount: outstanding,
    computedPaymentStatus,
  };
}

export const DEFAULT_INVOICE_TERMS = `1. Payment is due strictly in accordance with agreed credit terms stated on this Tax Invoice.
2. Direct Bank Transfers should be remitted to the LATIFAL STAR TECHNICAL SERVICES L.L.C designated bank account.
3. Please reference the Invoice Number (LSTS-INV-XXXX-XXX) on all payment advice and remittance notifications.
4. Any discrepancy or technical query regarding this invoice must be communicated in writing within 7 calendar days of receipt.
5. All technical works are certified under LATIFAL STAR standard warranty terms upon settlement of final outstanding balance.`;

export const LATIFAL_STAR_COMPANY_DETAILS = {
  legalName: "LATIFAL STAR TECHNICAL SERVICES L.L.C",
  address: "Deira, Port Saeed, Dubai",
  city: "Dubai",
  country: "United Arab Emirates",
  phone: "+971561574740",
  email: "info@latifalstar.com",
  trn: "100234567800003", // UAE 15-digit FTA TRN
  bankName: "Emirates NBD Bank PJSC",
  bankBranch: "Deira Branch, Dubai",
  accountName: "LATIFAL STAR TECHNICAL SERVICES L.L.C",
  accountNumber: "1012345678901",
  iban: "AE070260001012345678901",
  swiftCode: "EBILAEADXXX",
};
export const PREEDHAR_COMPANY_DETAILS = LATIFAL_STAR_COMPANY_DETAILS;
