import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "navy"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-slate-900 text-white border-slate-900",
    navy: "bg-[#F1F5F9] text-[#0B1F33] border-[#CBD5E1]",
    success: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    warning: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    danger: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
    info: "bg-slate-50 text-slate-600 border-slate-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  const dotColors = {
    default: "bg-slate-400",
    primary: "bg-[#2563EB]",
    navy: "bg-[#0B1F33]",
    success: "bg-[#15803D]",
    warning: "bg-[#B45309]",
    danger: "bg-[#B91C1C]",
    info: "bg-[#0369A1]",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold rounded-md border tracking-wide transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
}
