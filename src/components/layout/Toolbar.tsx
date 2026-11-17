import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Toolbar({
  search,
  filters,
  actions,
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-lg shadow-xs",
        className
      )}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 max-w-2xl">
        {search && <div className="w-full sm:w-72">{search}</div>}
        {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0 self-end md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
