import { PREEDHAR_COMPANY_DETAILS } from "@/lib/invoices/calculations";
import { UNIT_OPTIONS } from "@/lib/quotations/calculations";

export { PREEDHAR_COMPANY_DETAILS, UNIT_OPTIONS };

export type WorkCompletionStatus = string;

export type WorkItemStatus = "COMPLETED" | "IN_PROGRESS" | "PENDING";

export interface WorkItem {
  id: string;
  description: string;
  quantity?: number;
  unit?: string;
  status: WorkItemStatus;
  completionPercentage: number;
  remarks?: string;
}

export function calculateOverallCompletion(items: WorkItem[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (Number(item.completionPercentage) || 0), 0);
  return Math.round(total / items.length);
}

export const DEFAULT_WCR_TERMS = `1. Work Inspection: All technical works specified in this report have been executed, tested, and inspected according to PREEDHAR engineering quality protocols and UAE standard technical specifications.
2. Handover & Acceptance: Signing of this report confirms physical completion and site handover of the specified electro-mechanical equipment and technical systems.
3. Warranty Commencement: The commercial warranty period commences from the date of final client acknowledgement and sign-off on this document.
4. Site Clearance: The contractor confirms that the work area has been cleaned, surplus materials cleared, and systems left in safe operating condition.`;
