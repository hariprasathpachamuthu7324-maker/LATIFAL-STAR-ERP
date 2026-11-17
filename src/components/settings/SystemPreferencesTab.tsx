"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SystemPreferencesSettings } from "@/lib/data/settings-mock";
import { Sliders, ShieldCheck } from "lucide-react";

export function SystemPreferencesTab({
  data,
  onChange,
}: {
  data: SystemPreferencesSettings;
  onChange: (data: SystemPreferencesSettings) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#2563EB]" />
          Application & Regional Preferences
        </h3>
        <p className="text-xs text-slate-500">
          Currency baseline, date formatting standards, and automated calculation options.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div>
          <Input
            label="Base Accounting Currency"
            disabled
            value={data.baseCurrency}
            onChange={(e) => onChange({ ...data, baseCurrency: e.target.value })}
          />
          <p className="text-[10px] text-slate-400 mt-0.5">
            Default operating currency for United Arab Emirates (AED - Dirhams).
          </p>
        </div>

        <div>
          <Select
            label="Display Date Format"
            value={data.dateFormat}
            onChange={(e) => onChange({ ...data, dateFormat: e.target.value })}
            options={[
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO 8601 Standard)" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK / UAE Standard)" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US Standard)" },
            ]}
          />
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-slate-200 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoCalculateVat}
              onChange={(e) =>
                onChange({ ...data, autoCalculateVat: e.target.checked })
              }
              className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                Automatic UAE 5% VAT Computation
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically recalculate taxable amounts and VAT on line item rate changes.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.enableAuditLogging}
              onChange={(e) =>
                onChange({ ...data, enableAuditLogging: e.target.checked })
              }
              className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                Commercial Audit Log Trail
              </span>
              <span className="text-[11px] text-slate-500">
                Log user transitions, status updates, and payment allocations for financial auditing.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
