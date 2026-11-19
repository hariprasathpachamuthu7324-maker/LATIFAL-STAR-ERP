"use client";

import * as React from "react";
import {
  EnterpriseWorkspace,
  WorkspaceHeader,
  WorkspaceMain,
  WorkspaceSection,
  WorkspaceSummaryPanel,
} from "@/components/workspace";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { LineItemsEditor } from "./LineItemsEditor";
import { formatAED, generateUUID } from "@/lib/utils";
import { getNextDocNumber } from "@/lib/utils/doc-numbering";
import { SearchableCustomerSelector } from "@/components/customers/SearchableCustomerSelector";
import {
  calculateQuotationTotals,
  calculateLineItem,
  DEFAULT_QUOTATION_TERMS,
  DEFAULT_VAT_RATE,
  type CalculatedItem,
} from "@/lib/quotations/calculations";
import type { Customer } from "@/lib/data/customers-mock";
import type { Quotation, QuotationStatus } from "@/lib/data/quotations-mock";
import { Building2, Calendar, FileText, Save, CheckCircle, Receipt, ClipboardList, UserCheck } from "lucide-react";

export function QuotationFormModal({
  open,
  onOpenChange,
  quotationToEdit,
  customers,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationToEdit?: Quotation | null;
  customers: Customer[];
  onSave: (savedQuotation: Quotation) => void;
}) {
  const isEditing = !!quotationToEdit;

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getThirtyDaysLaterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  const [formData, setFormData] = React.useState({
    quotationNumber: "",
    customerId: "",
    customerName: "",
    clientPrintedName: "",
    attention: "",
    quotationDate: getTodayStr(),
    validUntil: getThirtyDaysLaterStr(),
    subject: "",
    projectName: "",
    projectLocation: "",
    notes: "",
    termsAndConditions: DEFAULT_QUOTATION_TERMS,
    signoffContactName: "Muthu",
    signoffContactPhone: "0561574740",
    status: "DRAFT" as QuotationStatus,
    overallDiscount: 0,
  });

  const [items, setItems] = React.useState<CalculatedItem[]>([
    calculateLineItem({
      description: "",
      quantity: 1,
      unit: "NOS",
      unitPrice: 0,
      discount: 0,
    }),
  ]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (quotationToEdit) {
      setFormData({
        quotationNumber: quotationToEdit.quotationNumber,
        customerId: quotationToEdit.customerId,
        customerName: quotationToEdit.customerName,
        clientPrintedName: quotationToEdit.clientPrintedName || quotationToEdit.customerName,
        attention: quotationToEdit.attention || "",
        quotationDate: quotationToEdit.quotationDate,
        validUntil: quotationToEdit.validUntil,
        subject: quotationToEdit.subject,
        projectName: quotationToEdit.projectName,
        projectLocation: quotationToEdit.projectLocation,
        notes: quotationToEdit.notes || "",
        termsAndConditions: quotationToEdit.termsAndConditions || DEFAULT_QUOTATION_TERMS,
        signoffContactName: quotationToEdit.signoffContactName || "Muthu",
        signoffContactPhone: quotationToEdit.signoffContactPhone || "0561574740",
        status: quotationToEdit.status,
        overallDiscount: 0,
      });
      setItems(quotationToEdit.items || []);
    } else {
      const defaultCust = customers[0];
      getNextDocNumber("quotation").then((nextNum) => {
        setFormData((prev) => ({ ...prev, quotationNumber: nextNum }));
      });
      setFormData({
        quotationNumber: "Generating...",
        customerId: defaultCust?.id || "",
        customerName: defaultCust?.companyName || "",
        clientPrintedName: defaultCust?.companyName || "",
        attention: defaultCust ? `${defaultCust.contactPerson}` : "",
        quotationDate: getTodayStr(),
        validUntil: getThirtyDaysLaterStr(),
        subject: "",
        projectName: "",
        projectLocation: defaultCust ? `${defaultCust.city}, UAE` : "Dubai, UAE",
        notes: "",
        termsAndConditions: DEFAULT_QUOTATION_TERMS,
        signoffContactName: "Muthu",
        signoffContactPhone: "0561574740",
        status: "DRAFT",
        overallDiscount: 0,
      });
      setItems([
        calculateLineItem({
          description: "",
          quantity: 1,
          unit: "NOS",
          unitPrice: 0,
          discount: 0,
        }),
      ]);
    }
    setErrors({});
  }, [quotationToEdit, open, customers]);

  const handleCustomerSelect = (cust: Customer | null) => {
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.companyName,
        clientPrintedName: cust.companyName,
        attention: cust.contactPerson || "",
        projectLocation: `${cust.address || cust.city || "Dubai"}, UAE`,
      }));
      if (errors.customerId) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.customerId;
          return next;
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
        clientPrintedName: "",
        attention: "",
      }));
    }
  };

  const totals = React.useMemo(() => {
    return calculateQuotationTotals(items, formData.overallDiscount, DEFAULT_VAT_RATE);
  }, [items, formData.overallDiscount]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerId) {
      errs.customerId = "Please select a client";
    }
    if (!formData.subject.trim()) {
      errs.subject = "Quotation subject / scope headline is required";
    }
    if (!formData.quotationDate) {
      errs.quotationDate = "Quotation date is required";
    }
    if (!formData.validUntil) {
      errs.validUntil = "Validity date is required";
    }
    if (new Date(formData.validUntil) < new Date(formData.quotationDate)) {
      errs.validUntil = "Valid-until date cannot be earlier than quotation date";
    }
    if (items.length === 0) {
      errs.items = "At least one line item is required";
    } else {
      const emptyItems = items.some((it) => !it.description.trim());
      if (emptyItems) {
        errs.items = "All line items must have a technical description";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields and item descriptions");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const quotation: Quotation = {
        id: quotationToEdit ? quotationToEdit.id : generateUUID(),
        quotationNumber: formData.quotationNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        clientPrintedName: formData.clientPrintedName || formData.customerName,
        attention: formData.attention || undefined,
        quotationDate: formData.quotationDate,
        validUntil: formData.validUntil,
        subject: formData.subject.trim(),
        projectName: formData.projectName.trim() || "Technical Services Execution",
        projectLocation: formData.projectLocation.trim() || "Dubai, UAE",
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxableAmount: totals.taxableAmount,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
        notes: formData.notes.trim() || undefined,
        termsAndConditions: formData.termsAndConditions.trim() || DEFAULT_QUOTATION_TERMS,
        signoffContactName: formData.signoffContactName.trim() || "Muthu",
        signoffContactPhone: formData.signoffContactPhone.trim() || "0561574740",
        status: formData.status,
        createdAt: quotationToEdit ? quotationToEdit.createdAt : now,
        updatedAt: now,
      };

      await onSave(quotation);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Quotation ${quotation.quotationNumber} updated successfully`
          : `Quotation ${quotation.quotationNumber} created successfully`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to persist quotation to database");
    }
  };

  return (
    <EnterpriseWorkspace open={open} onClose={() => onOpenChange(false)}>
      <WorkspaceHeader
        title={isEditing ? "Edit Quotation" : "Create Quotation"}
        subtitle="LATIFAL STAR TECHNICAL SERVICES L.L.C • Commercial Proposal Builder"
        documentNumber={formData.quotationNumber}
        onClose={() => onOpenChange(false)}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-transparent"
          >
            {isEditing ? "Save Changes" : "Save & Generate Quotation"}
          </Button>
        }
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceMain>
          <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
            <WorkspaceSection title="Client & Project Details" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <SearchableCustomerSelector
                    label="Select Client / Company"
                    required
                    value={formData.customerId}
                    onChange={handleCustomerSelect}
                    customers={customers}
                    error={errors.customerId}
                  />
                </div>

                <div>
                  <Input
                    label="Attention / Contact Person"
                    placeholder="e.g. Eng. Tariq Mansoor"
                    value={formData.attention}
                    onChange={(e) =>
                      setFormData({ ...formData, attention: e.target.value })
                    }
                  />
                </div>

                <div className="sm:col-span-3">
                  <Input
                    label="Quotation Subject / Scope Headline"
                    required
                    placeholder="e.g. Overhaul of 300TR Water-Cooled Chiller Unit #2 & Primary Pumps"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    error={errors.subject}
                  />
                </div>

                <div>
                  <Input
                    label="Project / Facility Name"
                    placeholder="e.g. Commercial Tower Chiller Plant"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Site / Project Location"
                    placeholder="e.g. Airport Road, Al Garhoud, Dubai"
                    value={formData.projectLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, projectLocation: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Select allowCustom
                    label="Quotation Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as QuotationStatus,
                      })
                    }
                    options={[
                      { value: "DRAFT", label: "Draft (Under Preparation)" },
                      { value: "SENT", label: "Sent to Client" },
                      { value: "ACCEPTED", label: "Accepted by Client" },
                      { value: "REJECTED", label: "Rejected" },
                      { value: "EXPIRED", label: "Expired" },
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Quotation Date"
                    type="date"
                    required
                    value={formData.quotationDate}
                    onChange={(e) =>
                      setFormData({ ...formData, quotationDate: e.target.value })
                    }
                    error={errors.quotationDate}
                  />
                </div>

                <div>
                  <Input
                    label="Valid Until"
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    error={errors.validUntil}
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Commercial Execution Items" icon={ClipboardList}>
              <LineItemsEditor items={items} onChange={setItems} />
              {errors.items && (
                <p className="text-xs text-red-600 font-medium mt-2">{errors.items}</p>
              )}
            </WorkspaceSection>

            <WorkspaceSection title="Terms, Conditions & Notes" icon={FileText}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Commercial Terms & Conditions"
                  rows={5}
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, termsAndConditions: e.target.value })
                  }
                />
                <Textarea
                  label="Internal Execution Notes"
                  placeholder="Site permits, shift timings, equipment access notes..."
                  rows={5}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Sign-Off & Authorized Contact (Thanks and Regards)" icon={UserCheck}>
              <p className="text-xs text-slate-500 mb-3">
                Specify the person name and mobile number displayed in the quotation sign-off block below Thanks and Regards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person Name"
                  placeholder="e.g. Muthu"
                  value={formData.signoffContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, signoffContactName: e.target.value })
                  }
                />
                <Input
                  label="Mobile / Phone Number"
                  placeholder="e.g. 0561574740"
                  value={formData.signoffContactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, signoffContactPhone: e.target.value })
                  }
                />
              </div>
            </WorkspaceSection>
          </form>
        </WorkspaceMain>

        <WorkspaceSummaryPanel>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Financial Summary
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Gross Subtotal:</span>
                <span className="font-semibold text-slate-800 font-numeric">
                  {formatAED(totals.subtotal)}
                </span>
              </div>
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Total Discount:</span>
                  <span className="font-semibold font-numeric">
                    -{formatAED(totals.discount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-slate-600">
                <span>Taxable Net:</span>
                <span className="font-semibold text-slate-800 font-numeric">
                  {formatAED(totals.taxableAmount)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-slate-600">
                <span>UAE VAT (5.00%):</span>
                <span className="font-semibold text-slate-800 font-numeric">
                  {formatAED(totals.vatAmount)}
                </span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-[#E2E8F0] text-base">
                <span className="font-bold text-[#002664]">Grand Total:</span>
                <span className="font-bold text-[#2563EB] font-numeric">
                  {formatAED(totals.grandTotal)}
                </span>
              </div>
            </div>
            
            <div className="pt-2 text-xs text-slate-500 bg-blue-50/50 p-3 rounded-md border border-blue-100">
              <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" />
                UAE Tax Compliance Note
              </p>
              Standard 5.00% VAT is computed on taxable sum in accordance with UAE Federal Tax Authority.
            </div>
          </div>
        </WorkspaceSummaryPanel>
      </div>
    </EnterpriseWorkspace>
  );
}
