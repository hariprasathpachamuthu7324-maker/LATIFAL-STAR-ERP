export interface DashboardKPI {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  variant: "navy" | "orange" | "default";
}

export interface ActivityMetric {
  category: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface RecentQuotation {
  id: string;
  docNumber: string;
  customerName: string;
  projectName: string;
  date: string;
  amount: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
}

export interface RecentInvoice {
  id: string;
  docNumber: string;
  customerName: string;
  projectName: string;
  date: string;
  amount: number;
  status: "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue";
}

export interface OperationalAlert {
  id: string;
  type: "Invoice" | "Quotation" | "Purchase Order" | "WCR";
  docNumber: string;
  entityName: string;
  description: string;
  amount?: number;
  dueDate: string;
  urgency: "high" | "medium" | "low";
  actionHref: string;
}

export interface DashboardData {
  kpis: DashboardKPI[];
  activityMetrics: ActivityMetric[];
  recentQuotations: RecentQuotation[];
  recentInvoices: RecentInvoice[];
  operationalAlerts: OperationalAlert[];
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
  kpis: [
    {
      id: "kpi-1",
      title: "Total Customers",
      value: "0",
      subtitle: "0 added this month",
      trend: { value: "0%", direction: "neutral" },
      variant: "navy",
    },
    {
      id: "kpi-2",
      title: "Active Quotations",
      value: "0",
      subtitle: "AED 0.00 total value",
      trend: { value: "0 pending", direction: "neutral" },
      variant: "orange",
    },
    {
      id: "kpi-3",
      title: "Outstanding Invoices",
      value: "0",
      subtitle: "AED 0.00 balance due",
      trend: { value: "0 overdue", direction: "neutral" },
      variant: "default",
    },
    {
      id: "kpi-4",
      title: "Pending Purchase Orders",
      value: "0",
      subtitle: "AED 0.00 committed",
      trend: { value: "0 in transit", direction: "neutral" },
      variant: "navy",
    },
  ],
  activityMetrics: [
    {
      category: "Quotations",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#2563EB]",
    },
    {
      category: "Tax Invoices Issued",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#0B1F33]",
    },
    {
      category: "Purchase Orders Committed",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-[#1E293B]",
    },
    {
      category: "Work Completion Reports",
      count: 0,
      amount: 0,
      percentage: 0,
      color: "bg-emerald-600",
    },
  ],
  recentQuotations: [],
  recentInvoices: [],
  operationalAlerts: [],
};
