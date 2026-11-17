"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import type { CompanyProfileSettings } from "@/lib/data/settings-mock";
import { Building2 } from "lucide-react";

export function CompanyProfileTab({
  data,
  onChange,
}: {
  data: CompanyProfileSettings;
  onChange: (data: CompanyProfileSettings) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2563EB]" />
          Company Identity & Commercial License
        </h3>
        <p className="text-xs text-slate-500">
          Official corporate profile printed across commercial proposals, tax invoices, purchase orders, and certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="sm:col-span-2">
          <Input
            label="Company Legal Name (Registered with Dubai DED)"
            required
            value={data.legalName}
            onChange={(e) => onChange({ ...data, legalName: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Dubai Trade License Number"
            required
            value={data.tradeLicenseNumber}
            onChange={(e) =>
              onChange({ ...data, tradeLicenseNumber: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="Year of Establishment"
            value={data.establishedYear}
            onChange={(e) =>
              onChange({ ...data, establishedYear: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Commercial Office Address"
            required
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="City / Emirate"
            required
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Country"
            required
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Official Telephone / Mobile"
            required
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Billing & Operations Email"
            type="email"
            required
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Company Website URL"
            value={data.website}
            onChange={(e) => onChange({ ...data, website: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
