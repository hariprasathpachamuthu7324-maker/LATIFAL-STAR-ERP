import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  id?: string;
  label?: React.ReactNode;
  helperText?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Switch({
  id,
  label,
  helperText,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <div className={cn("flex items-start space-x-3 select-none", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
          isChecked ? "bg-[#2563EB]" : "bg-slate-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            isChecked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      {(label || helperText) && (
        <div className="space-y-0.5" onClick={toggle}>
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "text-sm font-medium text-slate-800 cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
          {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        </div>
      )}
    </div>
  );
}
