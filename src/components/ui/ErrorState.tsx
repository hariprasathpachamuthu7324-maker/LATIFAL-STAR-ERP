import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  details?: string;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while communicating with the server. Please try again.",
  onRetry,
  details,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      className={cn(
        "p-6 md:p-8 rounded-lg border border-red-200 bg-red-50/50 text-left my-4",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-base font-bold text-red-950">{title}</h4>
          <p className="text-sm text-red-800 leading-relaxed">{message}</p>
          <div className="flex items-center gap-3 pt-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="border-red-300 text-red-700 hover:bg-red-100 bg-white"
              >
                Retry Request
              </Button>
            )}
            {details && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                {showDetails ? "Hide technical details" : "Show technical details"}
              </button>
            )}
          </div>
          {details && showDetails && (
            <pre className="mt-3 p-3 bg-red-950 text-red-100 text-xs rounded overflow-x-auto font-mono">
              {details}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
