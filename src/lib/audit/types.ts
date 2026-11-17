import type { UserRole } from "@/lib/auth/types";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "RECORD_PAYMENT"
  | "ASSIGN_ROLE"
  | "UPDATE_SETTINGS"
  | "EXPORT_PDF"
  | "LOGIN"
  | "LOGOUT";

export type AuditEntityType =
  | "CUSTOMER"
  | "QUOTATION"
  | "INVOICE"
  | "PURCHASE_ORDER"
  | "WORK_COMPLETION"
  | "TEAM_MEMBER"
  | "SETTINGS"
  | "AUTH";

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditFilterParams {
  searchQuery?: string;
  action?: AuditAction | "ALL";
  entityType?: AuditEntityType | "ALL";
  actorRole?: UserRole | "ALL";
  startDate?: string;
  endDate?: string;
}
