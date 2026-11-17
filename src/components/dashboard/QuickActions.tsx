"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UserPlus, FilePlus, Receipt, ClipboardPlus, CheckSquare } from "lucide-react";

const actions = [
  { title: "New Customer",       href: "/customers",       icon: <UserPlus className="w-3.5 h-3.5" /> },
  { title: "New Quotation",      href: "/quotations",      icon: <FilePlus className="w-3.5 h-3.5" /> },
  { title: "New Invoice",        href: "/invoices",        icon: <Receipt className="w-3.5 h-3.5" /> },
  { title: "New Purchase Order", href: "/purchase-orders", icon: <ClipboardPlus className="w-3.5 h-3.5" /> },
  { title: "New Work Report",    href: "/work-completion", icon: <CheckSquare className="w-3.5 h-3.5" /> },
];

export function QuickActions() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-1 border-b border-slate-100">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
        Quick Actions
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((act) => (
          <Link key={act.title} href={act.href}>
            <Button variant="outline" size="sm" leftIcon={act.icon} className="h-8 text-xs">
              {act.title}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
