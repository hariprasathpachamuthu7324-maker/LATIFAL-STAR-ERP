import {
  calculateQuotationTotals,
  calculateLineItem,
  DEFAULT_QUOTATION_TERMS,
  DEFAULT_VAT_RATE,
  type CalculatedItem,
} from "@/lib/quotations/calculations";

export type QuotationStatus = string;

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  clientPrintedName?: string;
  attention?: string;
  quotationDate: string;
  validUntil: string;
  subject: string;
  projectName: string;
  projectLocation: string;
  items: CalculatedItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  notes?: string;
  termsAndConditions: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MOCK_QUOTATIONS: Quotation[] = [];
