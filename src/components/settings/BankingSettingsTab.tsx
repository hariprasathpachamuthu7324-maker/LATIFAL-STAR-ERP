"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import type { BankingSettings } from "@/lib/data/settings-mock";
import { CreditCard, Landmark } from "lucide-react";

export function BankingSettingsTab({
  data,
  onChange,
}: {
  data: BankingSettings;
  onChange: (data: BankingSettings) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#2563EB]" />
          Commercial Banking & Remittance Coordinates
        </h3>
        <p className="text-xs text-slate-500">
          Official corporate bank transfer coordinates rendered on commercial tax invoices for client payments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div>
          <Input
            label="Corporate Bank Name"
            required
            value={data.bankName}
            onChange={(e) => onChange({ ...data, bankName: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Bank Branch Location"
            required
            value={data.bankBranch}
            onChange={(e) => onChange({ ...data, bankBranch: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Beneficiary Account Name"
            required
            value={data.accountName}
            onChange={(e) => onChange({ ...data, accountName: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Account Number"
            required
            value={data.accountNumber}
            onChange={(e) =>
              onChange({ ...data, accountNumber: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="SWIFT / BIC Code"
            required
            value={data.swiftCode}
            onChange={(e) => onChange({ ...data, swiftCode: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="UAE IBAN (International Bank Account Number)"
            required
            placeholder="AE340260000101928374650"
            value={data.iban}
            onChange={(e) => onChange({ ...data, iban: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
