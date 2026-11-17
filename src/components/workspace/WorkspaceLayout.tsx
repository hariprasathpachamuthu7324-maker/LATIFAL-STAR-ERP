"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function WorkspaceContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-hidden flex", className)}>
      {children}
    </div>
  );
}

export function WorkspaceMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex-1 overflow-y-auto bg-[#F5F7FA] p-4 sm:p-6 lg:p-8 flex flex-col gap-6", className)}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {children}
      </div>
    </main>
  );
}

export function WorkspaceSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-5 sm:p-6 rounded-lg border border-[#E2E8F0] bg-white shadow-sm space-y-4", className)}>
      <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        {Icon && <Icon className="w-4 h-4 text-[#2563EB]" />}
        {title}
      </h4>
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}

export function WorkspaceSidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("hidden lg:block w-64 xl:w-72 border-r border-[#E2E8F0] bg-white overflow-y-auto flex-shrink-0", className)}>
      <div className="p-4 space-y-1">
        {children}
      </div>
    </aside>
  );
}

export function WorkspaceSidebarItem({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
        active
          ? "bg-[#2563EB]/10 text-[#2563EB]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {Icon && <Icon className={cn("w-4 h-4", active ? "text-[#2563EB]" : "text-slate-400")} />}
      {label}
    </button>
  );
}

export function WorkspaceSummaryPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("hidden xl:block w-80 2xl:w-96 border-l border-[#E2E8F0] bg-white overflow-y-auto flex-shrink-0", className)}>
      <div className="p-5 space-y-6">
        {children}
      </div>
    </aside>
  );
}
