"use client";

import * as React from "react";
import Image from "next/image";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  documentNumber?: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

export function WorkspaceHeader({
  title,
  subtitle,
  documentNumber,
  onClose,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <header className="shrink-0 h-16 md:h-18 bg-[#0B1F33] text-white shadow-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-20">
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-white/10 shrink-0 md:hidden"
          title="Back / Close"
          aria-label="Back / Close"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white rounded-md shrink-0 shadow-sm border border-slate-700 p-0.5">
          <Image
            src="/brand/latifal-star-logo.png"
            alt="LATIFAL STAR Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold tracking-tight truncate text-white">
              {title}
            </h1>
            {documentNumber && (
              <>
                <span className="hidden sm:inline text-slate-500">•</span>
                <span className="text-xs sm:text-sm font-bold bg-white/10 text-white px-2 py-0.5 rounded border border-white/20 font-numeric tracking-tight truncate">
                  {documentNumber}
                </span>
              </>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] sm:text-xs font-medium truncate mt-0.5 uppercase tracking-wider">
              {typeof subtitle === 'string' && (subtitle.startsWith("LATIFAL STAR TECHNICAL SERVICES") || subtitle.startsWith("LATIFAL STAR TECHNICAL SERVICES")) ? (
                <>
                  <span className="text-[#3B82F6]">LATIFAL STAR</span>
                  <span className="text-[#E07614]"> TECHNICAL SERVICES</span>
                  <span className="text-slate-400">{subtitle.replace("LATIFAL STAR TECHNICAL SERVICES", "").replace("LATIFAL STAR TECHNICAL SERVICES", "")}</span>
                </>
              ) : (
                <span className="text-slate-400">{subtitle}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}

        <div className="h-6 w-px bg-white/20 hidden sm:block mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
          title="Close Workspace (Esc)"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

