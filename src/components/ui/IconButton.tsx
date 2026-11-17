import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "navy" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95";

    const variantStyles = {
      primary: "bg-slate-400 hover:bg-[#1D4ED8] text-white shadow-xs focus-visible:ring-slate-400",
      secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs focus-visible:ring-slate-400",
      navy: "bg-[#002664] hover:bg-[#003080] text-white shadow-xs focus-visible:ring-[#002664]",
      outline: "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus-visible:ring-slate-400",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-300",
      destructive: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus-visible:ring-red-500",
    };

    const sizeStyles = {
      xs: "w-7 h-7 p-1",
      sm: "w-8 h-8 p-1.5",
      md: "w-9 h-9 p-2",
      lg: "w-11 h-11 p-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
