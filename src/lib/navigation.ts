import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  ClipboardList,
  ClipboardCheck,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./auth/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    group: "MAIN",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
    ],
  },
  {
    group: "OPERATIONS & SALES",
    items: [
      {
        title: "Quotations",
        href: "/quotations",
        icon: FileText,
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: Receipt,
      },
      {
        title: "Purchase Orders",
        href: "/purchase-orders",
        icon: ClipboardList,
      },
      {
        title: "Work Completion",
        href: "/work-completion",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    group: "ADMINISTRATION",
    items: [
      {
        title: "Team & Roles",
        href: "/team",
        icon: UserCog,
        adminOnly: true,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function getFilteredNavigation(role: UserRole): NavGroup[] {
  return NAVIGATION_CONFIG.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.href === "/team") return true;
      if (item.adminOnly) return role === "ADMIN";
      return true;
    }),
  })).filter((group) => group.items.length > 0);
}
