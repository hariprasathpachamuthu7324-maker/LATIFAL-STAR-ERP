import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      required,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#334155] tracking-wide uppercase"
          >
            {label}
            {required && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y",
            error
              ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/15"
              : "border-[#E2E8F0] hover:border-slate-400 focus:border-[#2563EB] focus:ring-[#2563EB]/15",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[#B91C1C] font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64748B] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
