import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  variant?: "default" | "blue" | "navy" | "orange";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-5 px-6 border-r border-slate-200 last:border-r-0 relative overflow-hidden transition-all hover:bg-slate-50/50",
        className
      )}
    >
      {variant === "orange" && (
        <div className="absolute top-0 left-0 h-full w-[3px] bg-[#E07614]" />
      )}
      {variant === "navy" && (
        <div className="absolute top-0 left-0 h-full w-[3px] bg-[#0B1F33]" />
      )}
      {variant === "default" && (
        <div className="absolute top-0 left-0 h-full w-[3px] bg-slate-200" />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 leading-tight">{title}</span>
        {icon && (
          <span className="text-slate-400 shrink-0">{icon}</span>
        )}
      </div>
      <div>
        <div className="text-[28px] font-semibold tracking-tight text-slate-900 leading-none font-numeric">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-medium font-numeric",
                  trend.direction === "up" && "text-emerald-600",
                  trend.direction === "down" && "text-red-500",
                  trend.direction === "neutral" && "text-slate-400"
                )}
              >
                {trend.direction === "up" && <ArrowUpRight className="w-3 h-3" />}
                {trend.direction === "down" && <ArrowDownRight className="w-3 h-3" />}
                {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
            {trend?.label && <span>{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
