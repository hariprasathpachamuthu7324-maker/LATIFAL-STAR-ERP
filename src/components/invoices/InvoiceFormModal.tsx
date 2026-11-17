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
import { LineItemsEditor } from "@/components/quotations/LineItemsEditor";
import { formatAED, generateUUID } from "@/lib/utils";
import { getNextDocNumber } from "@/lib/utils/doc-numbering";
import { SearchableCustomerSelector } from "@/components/customers/SearchableCustomerSelector";
import {
  calculateInvoiceFinancials,
  calculateLineItem,
  calculateDueDate,
  PAYMENT_TERMS_OPTIONS,
  DEFAULT_INVOICE_TERMS,
  DEFAULT_VAT_RATE,
  type InvoiceDocumentStatus,
  type InvoicePaymentStatus,
} from "@/lib/invoices/calculations";
import type { CalculatedItem } from "@/lib/quotations/calculations";
import type { Customer } from "@/lib/data/customers-mock";
import type { Quotation } from "@/lib/data/quotations-mock";
import type { Invoice } from "@/lib/data/invoices-mock";
import {
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  Save,
  CreditCard,
  Receipt,
  Percent,
  CheckCircle,
} from "lucide-react";

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoiceToEdit,
  initialData,
  customers,
  quotations,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceToEdit: Invoice | null;
  initialData?: any;
  customers: Customer[];
  quotations: Quotation[];
  onSave: (savedInvoice: Invoice) => void;
}) {
  const isEditing = !!invoiceToEdit;
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = React.useState({
    invoiceNumber: "",
    customerId: "",
    customerName: "",
    clientPrintedName: "",
    attention: "",
    customerTrn: "",
    quotationId: "",
    quotationNumber: "",
    invoiceDate: getTodayStr(),
    dueDate: getTodayStr(),
    paymentTerms: "30 Days",
    subject: "",
    projectName: "",
    projectLocation: "",
    notes: "",
    termsAndConditions: DEFAULT_INVOICE_TERMS,
    status: "ISSUED" as InvoiceDocumentStatus,
    paymentStatus: "UNPAID" as InvoicePaymentStatus,
    amountPaid: 0,
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
        if (invoiceToEdit) {
      setFormData({
        invoiceNumber: invoiceToEdit.invoiceNumber,
        customerId: invoiceToEdit.customerId,
        customerName: invoiceToEdit.customerName,
        clientPrintedName: invoiceToEdit.clientPrintedName || invoiceToEdit.customerName,
        attention: invoiceToEdit.attention || "",
        customerTrn: invoiceToEdit.customerTrn || "",
        quotationId: invoiceToEdit.quotationId || "",
        quotationNumber: invoiceToEdit.quotationNumber || "",
        invoiceDate: invoiceToEdit.invoiceDate,
        dueDate: invoiceToEdit.dueDate,
        paymentTerms: invoiceToEdit.paymentTerms || "30 Days",
        subject: invoiceToEdit.subject,
        projectName: invoiceToEdit.projectName,
        projectLocation: invoiceToEdit.projectLocation,
        notes: invoiceToEdit.notes || "",
        termsAndConditions: invoiceToEdit.termsAndConditions || DEFAULT_INVOICE_TERMS,
        status: invoiceToEdit.status,
        paymentStatus: invoiceToEdit.paymentStatus,
        amountPaid: invoiceToEdit.amountPaid || 0,
        overallDiscount: invoiceToEdit.overallDiscount || 0,
      });
      setItems(invoiceToEdit.items || []);
    } else if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.items) {
        setItems(initialData.items);
      }
    } else {
      const defaultCust = customers[0];
      const today = getTodayStr();
      const initialTerms = "30 Days";
      getNextDocNumber("invoice").then((nextNum) => {
        setFormData((prev) => ({ ...prev, invoiceNumber: nextNum }));
      });
      setFormData({
        invoiceNumber: "Generating...",
        customerId: defaultCust?.id || "",
        customerName: defaultCust?.companyName || "",
        clientPrintedName: defaultCust?.companyName || "",
        attention: defaultCust ? defaultCust.contactPerson : "",
        customerTrn: defaultCust?.taxRegistrationNumber || "",
        quotationId: "",
        quotationNumber: "",
        invoiceDate: today,
        dueDate: calculateDueDate(today, initialTerms),
        paymentTerms: initialTerms,
        subject: "",
        projectName: "",
        projectLocation: defaultCust ? `${defaultCust.address || defaultCust.city}, UAE` : "Dubai, UAE",
        notes: "",
        termsAndConditions: DEFAULT_INVOICE_TERMS,
        status: "ISSUED",
        paymentStatus: "UNPAID",
        amountPaid: 0,
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
  }, [invoiceToEdit, open, customers]);

  const handleCustomerSelect = (cust: Customer | null) => {
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.companyName,
        clientPrintedName: cust.companyName,
        attention: cust.contactPerson || "",
        customerTrn: cust.taxRegistrationNumber || "",
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
        customerTrn: "",
      }));
    }
  };

  const handleQuotationSelect = (quoteId: string) => {
    if (!quoteId) {
      setFormData((prev) => ({
        ...prev,
        quotationId: "",
        quotationNumber: "",
      }));
      return;
    }

    const quote = quotations.find((q) => q.id === quoteId);
    if (quote) {
      const matchingCust = customers.find((c) => c.id === quote.customerId);

      setFormData((prev) => ({
        ...prev,
        quotationId: quote.id,
        quotationNumber: quote.quotationNumber,
        customerId: quote.customerId,
        customerName: quote.customerName,
        clientPrintedName: quote.clientPrintedName || quote.customerName,
        attention: quote.attention || matchingCust?.contactPerson || "",
        customerTrn: matchingCust?.taxRegistrationNumber || prev.customerTrn,
        subject: quote.subject,
        projectName: quote.projectName,
        projectLocation: quote.projectLocation,
      }));

      if (quote.items && quote.items.length > 0) {
        setItems(quote.items.map((it) => calculateLineItem(it)));
      }

      toast.info(`Imported scope and lines from Quotation ${quote.quotationNumber}`);
    }
  };

  const handlePaymentTermsChange = (newTerms: string) => {
    const updatedDueDate = calculateDueDate(formData.invoiceDate, newTerms);
    setFormData((prev) => ({
      ...prev,
      paymentTerms: newTerms,
      dueDate: updatedDueDate,
    }));
  };

  const handleInvoiceDateChange = (newDate: string) => {
    const updatedDueDate = calculateDueDate(newDate, formData.paymentTerms);
    setFormData((prev) => ({
      ...prev,
      invoiceDate: newDate,
      dueDate: updatedDueDate,
    }));
  };

  const financials = React.useMemo(() => {
    return calculateInvoiceFinancials(
      items,
      formData.overallDiscount,
      formData.amountPaid,
      formData.dueDate,
      DEFAULT_VAT_RATE
    );
  }, [items, formData.overallDiscount, formData.amountPaid, formData.dueDate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerId) {
      errs.customerId = "Please select a client";
    }
    if (!formData.subject.trim()) {
      errs.subject = "Invoice subject / scope headline is required";
    }
    if (!formData.invoiceDate) {
      errs.invoiceDate = "Invoice date is required";
    }
    if (!formData.dueDate) {
      errs.dueDate = "Payment due date is required";
    }
    if (new Date(formData.dueDate) < new Date(formData.invoiceDate)) {
      errs.dueDate = "Due date cannot be earlier than invoice date";
    }
    if (formData.amountPaid < 0) {
      errs.amountPaid = "Amount paid cannot be negative";
    }
    if (formData.amountPaid > financials.grandTotal && financials.grandTotal > 0) {
      errs.amountPaid = `Amount paid cannot exceed Grand Total (AED ${formatAED(financials.grandTotal)})`;
    }
    if (items.length === 0) {
      errs.items = "At least one line item is required";
    } else {
      const emptyDesc = items.some((it) => !it.description.trim());
      if (emptyDesc) {
        errs.items = "All line items must have a technical description";
      }
      const invalidQty = items.some((it) => it.quantity <= 0);
      if (invalidQty) {
        errs.items = "All line items must have a quantity greater than 0";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields and verify calculations");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const invoice: Invoice = {
        id: invoiceToEdit ? invoiceToEdit.id : generateUUID(),
        invoiceNumber: formData.invoiceNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        clientPrintedName: formData.clientPrintedName || formData.customerName,
        attention: formData.attention || undefined,
        customerTrn: formData.customerTrn || undefined,
        quotationId: formData.quotationId || undefined,
        quotationNumber: formData.quotationNumber || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        paymentTerms: formData.paymentTerms,
        subject: formData.subject.trim(),
        projectName: formData.projectName.trim() || "Technical Services Execution",
        projectLocation: formData.projectLocation.trim() || "Dubai, UAE",
        items,
        subtotal: financials.subtotal,
        discount: financials.discount,
        taxableAmount: financials.taxableAmount,
        vatRate: financials.vatRate,
        vatAmount: financials.vatAmount,
        grandTotal: financials.grandTotal,
        amountPaid: financials.amountPaid,
        outstandingAmount: financials.outstandingAmount,
        notes: formData.notes.trim() || undefined,
        termsAndConditions: formData.termsAndConditions.trim() || DEFAULT_INVOICE_TERMS,
        status: formData.status,
        paymentStatus: financials.computedPaymentStatus,
        createdAt: invoiceToEdit ? invoiceToEdit.createdAt : now,
        updatedAt: now,
      };

      await onSave(invoice);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Invoice ${invoice.invoiceNumber} updated successfully`
          : `Tax Invoice ${invoice.invoiceNumber} issued successfully`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to persist invoice to database");
    }
  };

  return (
    <EnterpriseWorkspace open={open} onClose={() => onOpenChange(false)}>
      <WorkspaceHeader
        title={isEditing ? "Edit Tax Invoice" : "Create Commercial Tax Invoice"}
        subtitle="LATIFAL STAR TECHNICAL SERVICES • UAE VAT Commercial Invoicing"
        documentNumber={formData.invoiceNumber}
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
            {isEditing ? "Save Changes" : "Generate Tax Invoice"}
          </Button>
        }
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceMain>
          <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
            <WorkspaceSection title="Client & Project Information" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 bg-slate-50 p-3.5 rounded-md border border-slate-200">
                  <Select
                    label="Reference Existing Quotation (Optional)"
                    value={formData.quotationId}
                    onChange={(e) => handleQuotationSelect(e.target.value)}
                    options={[
                      { value: "", label: "-- None (Direct Commercial Invoice) --" },
                      ...quotations.map((q) => ({
                        value: q.id,
                        label: `${q.quotationNumber} â€” ${q.customerName} (${formatAED(q.grandTotal)})`,
                      })),
                    ]}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Selecting a quotation will automatically import client details, project scope, and line items.
                  </p>
                </div>

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
                    label="Customer TRN (UAE VAT)"
                    placeholder="e.g. 100234567800003"
                    value={formData.customerTrn}
                    onChange={(e) =>
                      setFormData({ ...formData, customerTrn: e.target.value })
                    }
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

                <div className="sm:col-span-2">
                  <Input
                    label="Invoice Subject / Scope Headline"
                    required
                    placeholder="e.g. Overhaul of 300TR Water-Cooled Chiller Unit #2"
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

                <div className="sm:col-span-2">
                  <Input
                    label="Site / Project Location"
                    placeholder="e.g. Airport Road, Al Garhoud, Dubai"
                    value={formData.projectLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, projectLocation: e.target.value })
                    }
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Invoice Dates & Terms" icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <Input
                    label="Invoice Date"
                    type="date"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => handleInvoiceDateChange(e.target.value)}
                    error={errors.invoiceDate}
                  />
                </div>

                <div>
                  <Select
                    label="Payment Credit Terms"
                    allowCustom
                    value={formData.paymentTerms}
                    onChange={(e) => handlePaymentTermsChange(e.target.value)}
                    options={PAYMENT_TERMS_OPTIONS.map((t) => ({
                      value: t.value,
                      label: t.label,
                    }))}
                  />
                </div>

                <div>
                  <Input
                    label="Payment Due Date"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    error={errors.dueDate}
                  />
                </div>

                <div>
                  <Select allowCustom
                    label="Document Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as InvoiceDocumentStatus,
                      })
                    }
                    options={[
                      { value: "ISSUED", label: "Issued (Active)" },
                      { value: "DRAFT", label: "Draft (Under Review)" },
                      { value: "CANCELLED", label: "Cancelled / Void" },
                    ]}
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Line Items" icon={ClipboardList}>
              <LineItemsEditor items={items} onChange={setItems} />
              {errors.items && (
                <p className="text-xs text-red-600 font-medium mt-2">{errors.items}</p>
              )}
            </WorkspaceSection>

            <WorkspaceSection title="Invoice Terms & Execution Notes" icon={FileText}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Commercial & Bank Remittance Terms"
                  rows={5}
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, termsAndConditions: e.target.value })
                  }
                />
                <Textarea
                  label="Internal Accounting / Execution Notes"
                  placeholder="Payment receipts, bank transfer reference, job completion notes..."
                  rows={5}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </WorkspaceSection>
          </form>
        </WorkspaceMain>

        <WorkspaceSummaryPanel>
          <div className="space-y-6">
            {/* Financial Summary Totals */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Financial Summary
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-semibold text-slate-800 font-numeric">
                    {formatAED(financials.subtotal)}
                  </span>
                </div>

                {financials.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>Total Discount:</span>
                    <span className="font-semibold font-numeric">
                      -{formatAED(financials.discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Taxable Net:</span>
                  <span className="font-semibold text-slate-800 font-numeric">
                    {formatAED(financials.taxableAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>UAE VAT (5.00%):</span>
                  <span className="font-semibold text-slate-800 font-numeric">
                    {formatAED(financials.vatAmount)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#E2E8F0] text-base">
                  <span className="font-bold text-[#002664]">Grand Total:</span>
                  <span className="font-bold text-[#002664] font-numeric">
                    {formatAED(financials.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Tracking Box */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                Payment Tracking
              </h3>

              <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] space-y-4 shadow-sm">
                <Input
                  label="Amount Paid to Date (AED)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountPaid || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amountPaid: Number(e.target.value) || 0,
                    })
                  }
                  error={errors.amountPaid}
                />

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Computed Status:</span>
                  <span className="font-bold text-xs text-[#002664] bg-slate-100 px-2 py-0.5 rounded">
                    {financials.computedPaymentStatus}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm font-bold pt-1 text-amber-700">
                  <span>Outstanding Balance:</span>
                  <span className="font-numeric">
                    {formatAED(financials.outstandingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </WorkspaceSummaryPanel>
      </div>
    </EnterpriseWorkspace>
  );
}

