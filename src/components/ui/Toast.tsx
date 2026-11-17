"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          "!bg-white !text-slate-900 !border-slate-200 !shadow-lg !rounded-lg !text-xs !font-medium",
      }}
    />
  );
}

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, {
      description,
      className: "!border-emerald-200 !bg-emerald-50/90 !text-emerald-900",
    }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description,
      className: "!border-rose-200 !bg-rose-50/90 !text-rose-900",
    }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, {
      description,
      className: "!border-sky-200 !bg-sky-50/90 !text-sky-900",
    }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, {
      description,
      className: "!border-amber-200 !bg-amber-50/90 !text-amber-900",
    }),
};
