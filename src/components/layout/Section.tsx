import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "plain" | "card" | "muted";
}

export function Section({
  variant = "card",
  className,
  children,
  ...props
}: SectionProps) {
  const variantStyles = {
    plain: "w-full",
    card: "w-full p-5 md:p-6 bg-white rounded-lg border border-slate-200/80 shadow-xs",
    muted: "w-full p-5 md:p-6 bg-slate-50/80 rounded-lg border border-slate-200/60",
  };

  return (
    <section className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </section>
  );
}
