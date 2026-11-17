import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  variant?: "inline" | "cards";
  className?: string;
  disabled?: boolean;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  options,
  variant = "inline",
  className,
  disabled,
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (val: string) => {
    if (disabled) return;
    setSelectedValue(val);
    onChange?.(val);
  };

  return (
    <div
      role="radiogroup"
      className={cn(
        variant === "inline" ? "flex flex-wrap gap-4" : "grid gap-3",
        className
      )}
    >
      {options.map((opt) => {
        const isChecked = selectedValue === opt.value;
        const isDisabled = disabled || opt.disabled;

        if (variant === "cards") {
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex items-start p-3.5 border rounded-lg cursor-pointer transition-all duration-150 bg-white",
                isChecked
                  ? "border-[#2563EB] ring-1 ring-[#2563EB] bg-[#EFF6FF]"
                  : "border-slate-200 hover:border-slate-300",
                isDisabled && "opacity-50 cursor-not-allowed bg-slate-50"
              )}
            >
              <div className="flex items-center h-5 mr-3">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => handleChange(opt.value)}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 focus:ring-[#2563EB]"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                {opt.description && (
                  <p className="text-xs text-slate-500">{opt.description}</p>
                )}
              </div>
            </label>
          );
        }

        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-center space-x-2 cursor-pointer select-none",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => handleChange(opt.value)}
              className="w-4 h-4 text-[#2563EB] border-slate-300 focus:ring-[#2563EB]"
            />
            <span className="text-sm font-medium text-slate-800">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
