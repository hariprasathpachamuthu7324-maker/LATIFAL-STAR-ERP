import {
  calculateLineItem,
  type CalculatedItem,
} from "@/lib/quotations/calculations";
import {
  type InvoiceDocumentStatus,
  type InvoicePaymentStatus,
  DEFAULT_INVOICE_TERMS,
} from "@/lib/invoices/calculations";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  clientPrintedName?: string;
  attention?: string;
  customerTrn?: string;
  quotationId?: string;
  quotationNumber?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
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
  amountPaid: number;
  outstandingAmount: number;
  notes?: string;
  termsAndConditions: string;
  status: InvoiceDocumentStatus;
  paymentStatus: InvoicePaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MOCK_INVOICES: Invoice[] = [];
