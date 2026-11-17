import * as React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Panel({
  title,
  subtitle,
  headerAction,
  footer,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
          {footer}
        </div>
      )}
    </div>
  );
}
