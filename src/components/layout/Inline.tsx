import * as React from "react";
import { cn } from "@/lib/utils";

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
}

export function Inline({
  spacing = "md",
  align = "center",
  justify = "start",
  wrap = true,
  className,
  children,
  ...props
}: InlineProps) {
  const spacingStyles = {
    none: "gap-0",
    xs: "gap-1.5",
    sm: "gap-2.5",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const alignStyles = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    baseline: "items-baseline",
  };

  const justifyStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        "flex",
        wrap && "flex-wrap",
        spacingStyles[spacing],
        alignStyles[align],
        justifyStyles[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
