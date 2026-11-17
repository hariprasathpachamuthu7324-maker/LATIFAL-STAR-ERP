import {
  type WorkCompletionStatus,
  type WorkItem,
  DEFAULT_WCR_TERMS,
} from "@/lib/work-completion/calculations";

export interface ClientAcknowledgement {
  clientRepresentativeName: string;
  designation: string;
  contactPhone?: string;
  acknowledgementDate: string;
  status: "ACCEPTED" | "ACCEPTED_WITH_COMMENTS" | "PENDING";
}

import type { WCRPhotoAttachment } from "@/lib/storage/types";

export interface WorkCompletionReport {
  id: string;
  reportNumber: string;
  customerId: string;
  customerName: string;
  clientPrintedName?: string;
  attention?: string;
  customerTrn?: string;
  quotationId?: string;
  quotationNumber?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  reportDate: string;
  workStartDate: string;
  workCompletionDate: string;
  subject: string;
  projectName: string;
  projectLocation: string;
  workDescription: string;
  completionPercentage: number;
  items: WorkItem[];
  photos?: WCRPhotoAttachment[];
  observations?: string;
  materialsUsed?: string;
  engineerInCharge: string;
  clientRemarks?: string;
  clientAcknowledgement?: ClientAcknowledgement;
  notes?: string;
  termsAndConditions: string;
  status: WorkCompletionStatus;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MOCK_WORK_REPORTS: WorkCompletionReport[] = [];
