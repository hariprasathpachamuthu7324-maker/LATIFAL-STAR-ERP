"use client";

import * as React from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  blobUrl: string | null;
  filename: string;
}

export function PDFPreviewModal({ open, onClose, blobUrl, filename }: PDFPreviewModalProps) {
  // Revoke previous blob URL on close to free memory
  React.useEffect(() => {
    if (!open && blobUrl) {
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [open, blobUrl]);

  // Intercept Escape key to close ONLY the PDF preview modal without closing underlying viewers
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, onClose]);

  if (!open || !blobUrl) return null;

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-black/80" role="dialog" aria-modal="true">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B1F33] shrink-0">
        <span className="text-sm font-medium text-white truncate">{filename}</span>
        <div className="flex items-center gap-2">
          <a
            href={blobUrl}
            download={filename}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#E07614] text-white rounded-lg hover:bg-[#c96a10] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 min-h-0 bg-zinc-900/50 flex items-center justify-center p-4">
        <object
          data={blobUrl}
          type="application/pdf"
          className="w-full h-full max-w-5xl rounded shadow-2xl bg-white"
          title={filename}
        >
          <div className="text-white text-center">
            <p>Your browser does not support inline PDF viewing.</p>
            <a href={blobUrl} download={filename} className="text-[#E07614] hover:underline mt-2 inline-block">
              Click here to download the PDF
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}
