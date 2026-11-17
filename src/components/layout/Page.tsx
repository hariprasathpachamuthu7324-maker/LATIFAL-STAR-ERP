import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

export function Page({
  maxWidth = "7xl",
  className,
  children,
  ...props
}: PageProps) {
  const maxWidthStyles = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <main
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 transition-all",
        maxWidthStyles[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}
