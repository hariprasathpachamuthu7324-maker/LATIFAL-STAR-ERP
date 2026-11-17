import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "navy" | "outline" | "ghost" | "destructive" | "link" | "danger" | "success" | "toolbar";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#0B1F33] hover:bg-[#0F2940] active:bg-[#070E18] text-white shadow-sm focus-visible:ring-[#0B1F33] border border-[#0B1F33]",
      secondary:
        "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-[#E2E8F0] shadow-xs focus-visible:ring-slate-400",
      navy:
        "bg-[#0B1F33] hover:bg-[#112843] active:bg-[#070E18] text-white shadow-xs focus-visible:ring-[#0B1F33] border border-[#0B1F33]",
      outline:
        "bg-transparent hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-[#E2E8F0] focus-visible:ring-slate-400",
      ghost:
        "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-300",
      toolbar:
        "bg-transparent text-slate-200 border border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-slate-300",
      destructive:
        "bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white shadow-xs focus-visible:ring-[#B91C1C] border border-[#B91C1C]",
      link:
        "bg-transparent text-slate-700 hover:underline underline-offset-4 p-0 h-auto focus-visible:ring-0",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8 rounded-md",
      md: "text-xs font-semibold px-4 py-2 gap-2 h-9 rounded-lg",
      lg: "text-sm font-semibold px-5 py-2.5 gap-2.5 h-11 rounded-lg",
    };

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
