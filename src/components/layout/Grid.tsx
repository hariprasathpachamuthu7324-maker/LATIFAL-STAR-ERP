import * as React from "react";
import { cn } from "@/lib/utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Grid({
  cols = 3,
  gap = "md",
  className,
  children,
  ...props
}: GridProps) {
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-12",
  };

  const gapStyles = {
    xs: "gap-2",
    sm: "gap-3",
    md: "gap-4 md:gap-5",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div
      className={cn("grid w-full", colStyles[cols], gapStyles[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
