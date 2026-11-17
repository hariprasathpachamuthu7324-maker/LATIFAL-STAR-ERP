"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import type { TaxSettings } from "@/lib/data/settings-mock";
import { Percent, ShieldAlert } from "lucide-react";

export function TaxSettingsTab({
  data,
  onChange,
}: {
  data: TaxSettings;
  onChange: (data: TaxSettings) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
          <Percent className="w-4 h-4 text-[#2563EB]" />
          UAE Federal Tax Authority (FTA) Registration
        </h3>
        <p className="text-xs text-slate-500">
          Value Added Tax (VAT) rate and Tax Registration Number (TRN) for LATIFAL STAR commercial invoices.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#0B1F33] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">UAE Federal Tax Authority Standard (5.00%)</span>
          <p className="text-slate-600 text-[11px] mt-0.5">
            Under UAE Federal Decree-Law No. 8 of 2017, the standard VAT rate is 5.00% across technical electro-mechanical contracting services. Changing this rate impacts newly generated commercial proposals and tax invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div>
          <Input
            label="Official 15-Digit TRN (Tax Registration Number)"
            required
            placeholder="100458921400003"
            value={data.trn}
            onChange={(e) => onChange({ ...data, trn: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Standard VAT Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            value={data.standardVatRate}
            onChange={(e) =>
              onChange({
                ...data,
                standardVatRate: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>

        <div>
          <Input
            label="Tax Jurisdiction Authority"
            value={data.taxOfficeJurisdiction}
            onChange={(e) =>
              onChange({ ...data, taxOfficeJurisdiction: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="VAT Registration Effective Date"
            type="date"
            value={data.vatRegistrationDate}
            onChange={(e) =>
              onChange({ ...data, vatRegistrationDate: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
