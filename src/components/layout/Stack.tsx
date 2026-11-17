import * as React from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
  align?: "start" | "center" | "end" | "stretch";
  divider?: boolean;
}

export function Stack({
  spacing = "md",
  align = "stretch",
  divider = false,
  className,
  children,
  ...props
}: StackProps) {
  const spacingStyles = {
    none: "space-y-0",
    xs: "space-y-1.5",
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  };

  const alignStyles = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        spacingStyles[spacing],
        alignStyles[align],
        divider && "divide-y divide-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
