"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  documentType: string;
  documentNumber: string;
  statusBadges?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  documentClassName?: string;
}

export function DocumentViewer({
  open,
  onClose,
  documentType,
  documentNumber,
  statusBadges,
  actions,
  children,
  className,
  documentClassName,
}: DocumentViewerProps) {
  const [mounted, setMounted] = React.useState(false);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && viewerRef.current) {
        const focusableElements = viewerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const content = (
    <div
      ref={viewerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${documentType}: ${documentNumber}`}
      className={cn(
        "fixed inset-0 z-[500] flex flex-col bg-[#F0F4F8] select-text animate-in fade-in duration-150 print:bg-white print:static print:inset-auto",
        className
      )}
    >
      {/* Toolbar */}
      <header className="shrink-0 h-[60px] bg-[#0B1F33] border-b border-[#1a3a5c] shadow-lg px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-10 print:hidden">
        {/* Left: Back button (mobile) + doc info */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 shrink-0 md:hidden rounded-lg"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Orange accent bar */}
          <div className="hidden md:block w-0.5 h-7 rounded-full bg-[#E07614] shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E07614]">
                {documentType}
              </span>
              <span className="text-slate-600">·</span>
              <h1 className="text-sm sm:text-[15px] font-bold text-white font-numeric tracking-tight truncate">
                {documentNumber}
              </h1>
            </div>
            {statusBadges && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {statusBadges}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions + Close */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {actions && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {actions}
            </div>
          )}

          <div className="h-5 w-px bg-white/15 hidden sm:block mx-1" />

          <Button
            ref={closeBtnRef}
            variant="ghost"
            size="sm"
            leftIcon={<X className="w-3.5 h-3.5" />}
            onClick={onClose}
            className="hidden sm:inline-flex h-8 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-lg focus-visible:ring-2 focus-visible:ring-white/40"
            title="Close (Esc)"
          >
            Close
          </Button>
        </div>
      </header>

      {/* Document canvas */}
      <main className="flex-1 overflow-y-auto bg-[#F0F4F8] py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 print:p-0 print:overflow-visible print:bg-white">
        <div
          className={cn(
            "w-full max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-48px)] md:max-w-[880px] mx-auto bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-10 md:p-12 text-slate-800 space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-full",
            documentClassName
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );

  return createPortal(content, document.body);
}
