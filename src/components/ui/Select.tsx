import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement | HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  required?: boolean;
  allowCustom?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement | HTMLInputElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      required,
      disabled,
      options = [],
      children,
      allowCustom = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const dataListId = `${selectId}-list`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#334155] tracking-wide uppercase"
          >
            {label}
            {required && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {allowCustom ? (
            <>
              <input
                id={selectId}
                ref={ref as React.Ref<HTMLInputElement>}
                list={dataListId}
                disabled={disabled}
                value={value}
                onChange={onChange as any}
                className={cn(
                  "w-full h-9 pl-3 pr-8 py-2 text-sm bg-white border rounded-lg text-[#0F172A] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
                  error
                    ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/15"
                    : "border-slate-200 hover:border-slate-400 focus:border-slate-700 focus:ring-slate-700/10",
                  className
                )}
                {...(props as any)}
              />
              <datalist id={dataListId}>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label !== opt.value ? opt.label : undefined}
                  </option>
                ))}
              </datalist>
            </>
          ) : (
            <>
              <select
                id={selectId}
                ref={ref as React.Ref<HTMLSelectElement>}
                disabled={disabled}
                value={value}
                onChange={onChange as any}
                className={cn(
                  "w-full h-9 pl-3 pr-8 py-2 text-sm bg-white border rounded-lg text-[#0F172A] appearance-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer",
                  error
                    ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/15"
                    : "border-slate-200 hover:border-slate-400 focus:border-slate-700 focus:ring-slate-700/10",
                  className
                )}
                {...(props as any)}
              >
                {children
                  ? children
                  : options.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </option>
                    ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#B91C1C] font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64748B] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
