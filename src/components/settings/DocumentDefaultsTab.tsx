"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { DocumentDefaultsSettings } from "@/lib/data/settings-mock";
import { FileText } from "lucide-react";

export function DocumentDefaultsTab({
  data,
  onChange,
}: {
  data: DocumentDefaultsSettings;
  onChange: (data: DocumentDefaultsSettings) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          Document Numbering & Standard Clauses
        </h3>
        <p className="text-xs text-slate-500">
          Prefix standards, default credit terms, and standard contractual clauses populated across commercial documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        <div>
          <Input
            label="Quotation Prefix"
            required
            value={data.quotationPrefix}
            onChange={(e) =>
              onChange({ ...data, quotationPrefix: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="Invoice Prefix"
            required
            value={data.invoicePrefix}
            onChange={(e) =>
              onChange({ ...data, invoicePrefix: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="Purchase Order Prefix"
            required
            value={data.purchaseOrderPrefix}
            onChange={(e) =>
              onChange({ ...data, purchaseOrderPrefix: e.target.value })
            }
          />
        </div>

        <div>
          <Input
            label="Work Report Prefix"
            required
            value={data.workCompletionPrefix}
            onChange={(e) =>
              onChange({ ...data, workCompletionPrefix: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <Input
            label="Default Payment Terms"
            required
            value={data.defaultPaymentTerms}
            onChange={(e) =>
              onChange({ ...data, defaultPaymentTerms: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <Textarea
            label="Standard Warranty Clause"
            rows={3}
            value={data.standardWarrantyClause}
            onChange={(e) =>
              onChange({ ...data, standardWarrantyClause: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <Textarea
            label="Standard Remittance & Advice Clause"
            rows={3}
            value={data.standardRemittanceClause}
            onChange={(e) =>
              onChange({ ...data, standardRemittanceClause: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
