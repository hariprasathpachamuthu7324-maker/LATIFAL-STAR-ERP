import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  wrapperClassName?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
  wrapperClassName,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={cn("relative flex w-full justify-center", wrapperClassName)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#001D4D] border border-[#003080] rounded shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in-50 duration-150",
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
