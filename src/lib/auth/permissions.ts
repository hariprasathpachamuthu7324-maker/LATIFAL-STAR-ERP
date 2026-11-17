import type { UserRole } from "./types";

export type Permission =
  // Customers
  | "customers:view"
  | "customers:create"
  | "customers:edit"
  | "customers:delete"
  // Quotations
  | "quotations:view"
  | "quotations:create"
  | "quotations:edit"
  | "quotations:issue"
  | "quotations:cancel"
  // Invoices
  | "invoices:view"
  | "invoices:create"
  | "invoices:edit"
  | "invoices:issue"
  | "invoices:cancel"
  | "invoices:record_payment"
  // Purchase Orders
  | "purchase_orders:view"
  | "purchase_orders:create"
  | "purchase_orders:edit"
  | "purchase_orders:issue"
  | "purchase_orders:cancel"
  // Work Completion Reports
  | "work_completion:view"
  | "work_completion:create"
  | "work_completion:edit"
  | "work_completion:complete"
  | "work_completion:cancel"
  // Team
  | "team:view"
  | "team:create"
  | "team:edit"
  | "team:assign_roles"
  | "team:delete"
  // Settings & Configuration
  | "settings:view"
  | "settings:edit"
  // Audit Logs
  | "audit:view";

/**
 * Role Permission Matrix defining exact capabilities for ADMIN, MANAGER, and STAFF
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "customers:view",
    "customers:create",
    "customers:edit",
    "customers:delete",
    "quotations:view",
    "quotations:create",
    "quotations:edit",
    "quotations:issue",
    "quotations:cancel",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:issue",
    "invoices:cancel",
    "invoices:record_payment",
    "purchase_orders:view",
    "purchase_orders:create",
    "purchase_orders:edit",
    "purchase_orders:issue",
    "purchase_orders:cancel",
    "work_completion:view",
    "work_completion:create",
    "work_completion:edit",
    "work_completion:complete",
    "work_completion:cancel",
    "team:view",
    "team:create",
    "team:edit",
    "team:assign_roles",
    "team:delete",
    "settings:view",
    "settings:edit",
    "audit:view",
  ],
  MANAGER: [
    "customers:view",
    "customers:create",
    "customers:edit",
    "quotations:view",
    "quotations:create",
    "quotations:edit",
    "quotations:issue",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:issue",
    "invoices:record_payment",
    "purchase_orders:view",
    "purchase_orders:create",
    "purchase_orders:edit",
    "purchase_orders:issue",
    "work_completion:view",
    "work_completion:create",
    "work_completion:edit",
    "work_completion:complete",
    "team:view",
    "settings:view",
    "audit:view",
  ],
  STAFF: [
    "customers:view",
    "quotations:view",
    "quotations:create",
    "quotations:edit",
    "invoices:view",
    "purchase_orders:view",
    "purchase_orders:create",
    "purchase_orders:edit",
    "work_completion:view",
    "work_completion:create",
    "work_completion:edit",
    "team:view",
    "settings:view",
  ],
};

/**
 * Checks if a given role has a specific permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Validates that an actor has permission, throwing an unauthorized error otherwise
 */
export function assertPermission(role: UserRole | undefined | null, permission: Permission, actionDescription?: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Access Denied: Role '${role || "ANONYMOUS"}' does not have permission to ${actionDescription || permission}.`
    );
  }
}
