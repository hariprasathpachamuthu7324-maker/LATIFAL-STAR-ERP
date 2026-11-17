import {
  calculateLineItem,
  type CalculatedItem,
} from "@/lib/quotations/calculations";
import {
  type PurchaseOrderStatus,
  DEFAULT_PURCHASE_ORDER_TERMS,
} from "@/lib/purchase-orders/calculations";

export interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  customerId: string;
  customerName: string;
  clientPrintedName?: string;
  attention?: string;
  customerTrn?: string;
  quotationId?: string;
  quotationNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  poDate: string;
  expectedDeliveryDate: string;
  subject: string;
  projectName: string;
  projectLocation: string;
  deliveryAddress?: string;
  items: CalculatedItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  notes?: string;
  termsAndConditions: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
