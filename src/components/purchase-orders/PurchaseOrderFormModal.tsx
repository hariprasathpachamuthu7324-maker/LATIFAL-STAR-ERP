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
  calculateQuotationTotals,
  calculateLineItem,
  calculateDeliveryDate,
  DEFAULT_PURCHASE_ORDER_TERMS,
  DEFAULT_VAT_RATE,
  type PurchaseOrderStatus,
} from "@/lib/purchase-orders/calculations";
import type { CalculatedItem } from "@/lib/quotations/calculations";
import type { Customer } from "@/lib/data/customers-mock";
import type { Quotation } from "@/lib/data/quotations-mock";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import {
  ClipboardList,
  Building2,
  Calendar,
  FileText,
  Save,
} from "lucide-react";

export function PurchaseOrderFormModal({
  open,
  onOpenChange,
  purchaseOrderToEdit,
  customers,
  quotations,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderToEdit?: PurchaseOrder | null;
  customers: Customer[];
  quotations: Quotation[];
  onSave: (savedPO: PurchaseOrder) => void;
}) {
  const isEditing = !!purchaseOrderToEdit;

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = React.useState({
    purchaseOrderNumber: "",
    customerId: "",
    customerName: "",
    clientPrintedName: "",
    attention: "",
    customerTrn: "",
    quotationId: "",
    quotationNumber: "",
    poDate: getTodayStr(),
    expectedDeliveryDate: getTodayStr(),
    subject: "",
    projectName: "",
    projectLocation: "",
    deliveryAddress: "",
    notes: "",
    termsAndConditions: DEFAULT_PURCHASE_ORDER_TERMS,
    status: "ISSUED" as PurchaseOrderStatus,
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
    if (purchaseOrderToEdit) {
      setFormData({
        purchaseOrderNumber: purchaseOrderToEdit.purchaseOrderNumber,
        customerId: purchaseOrderToEdit.customerId,
        customerName: purchaseOrderToEdit.customerName,
        clientPrintedName:
          purchaseOrderToEdit.clientPrintedName ||
          purchaseOrderToEdit.customerName,
        attention: purchaseOrderToEdit.attention || "",
        customerTrn: purchaseOrderToEdit.customerTrn || "",
        quotationId: purchaseOrderToEdit.quotationId || "",
        quotationNumber: purchaseOrderToEdit.quotationNumber || "",
        poDate: purchaseOrderToEdit.poDate,
        expectedDeliveryDate: purchaseOrderToEdit.expectedDeliveryDate,
        subject: purchaseOrderToEdit.subject,
        projectName: purchaseOrderToEdit.projectName,
        projectLocation: purchaseOrderToEdit.projectLocation,
        deliveryAddress:
          purchaseOrderToEdit.deliveryAddress ||
          purchaseOrderToEdit.projectLocation,
        notes: purchaseOrderToEdit.notes || "",
        termsAndConditions:
          purchaseOrderToEdit.termsAndConditions ||
          DEFAULT_PURCHASE_ORDER_TERMS,
        status: purchaseOrderToEdit.status,
        overallDiscount: 0,
      });
      setItems(purchaseOrderToEdit.items || []);
    } else {
      const defaultCust = customers[0];
      const today = getTodayStr();
      getNextDocNumber("purchase_order").then((nextNum) => {
        setFormData((prev) => ({ ...prev, purchaseOrderNumber: nextNum }));
      });
      setFormData({
        purchaseOrderNumber: "Generating...",
        customerId: defaultCust?.id || "",
        customerName: defaultCust?.companyName || "",
        clientPrintedName: defaultCust?.companyName || "",
        attention: defaultCust ? defaultCust.contactPerson : "",
        customerTrn: defaultCust?.taxRegistrationNumber || "",
        quotationId: "",
        quotationNumber: "",
        poDate: today,
        expectedDeliveryDate: calculateDeliveryDate(today, 14),
        subject: "",
        projectName: "",
        projectLocation: defaultCust
          ? `${defaultCust.address || defaultCust.city}, UAE`
          : "Dubai, UAE",
        deliveryAddress: defaultCust
          ? `${defaultCust.address || defaultCust.city}, UAE`
          : "Dubai, UAE",
        notes: "",
        termsAndConditions: DEFAULT_PURCHASE_ORDER_TERMS,
        status: "ISSUED",
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
  }, [purchaseOrderToEdit, open, customers]);

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
        deliveryAddress: `${cust.address || cust.city || "Dubai"}, UAE`,
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
        subject: `Procurement for ${quote.subject}`,
        projectName: quote.projectName,
        projectLocation: quote.projectLocation,
        deliveryAddress: quote.projectLocation,
      }));

      if (quote.items && quote.items.length > 0) {
        setItems(quote.items.map((it) => calculateLineItem(it)));
      }

      toast.info(`Imported procurement scope and line items from Quotation ${quote.quotationNumber}`);
    }
  };

  const totals = React.useMemo(() => {
    return calculateQuotationTotals(items, formData.overallDiscount, DEFAULT_VAT_RATE);
  }, [items, formData.overallDiscount]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerId) {
      errs.customerId = "Please select a client or vendor entity";
    }
    if (!formData.subject.trim()) {
      errs.subject = "Purchase Order subject / scope headline is required";
    }
    if (!formData.poDate) {
      errs.poDate = "PO date is required";
    }
    if (!formData.expectedDeliveryDate) {
      errs.expectedDeliveryDate = "Expected delivery date is required";
    }
    if (new Date(formData.expectedDeliveryDate) < new Date(formData.poDate)) {
      errs.expectedDeliveryDate = "Delivery date cannot be earlier than PO date";
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
      const po: PurchaseOrder = {
        id: purchaseOrderToEdit ? purchaseOrderToEdit.id : generateUUID(),
        purchaseOrderNumber: formData.purchaseOrderNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        clientPrintedName:
          formData.clientPrintedName || formData.customerName,
        attention: formData.attention || undefined,
        customerTrn: formData.customerTrn || undefined,
        quotationId: formData.quotationId || undefined,
        quotationNumber: formData.quotationNumber || undefined,
        poDate: formData.poDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        subject: formData.subject.trim(),
        projectName:
          formData.projectName.trim() || "Technical Procurement & Supply",
        projectLocation: formData.projectLocation.trim() || "Dubai, UAE",
        deliveryAddress:
          formData.deliveryAddress.trim() || formData.projectLocation,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxableAmount: totals.taxableAmount,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
        notes: formData.notes.trim() || undefined,
        termsAndConditions:
          formData.termsAndConditions.trim() || DEFAULT_PURCHASE_ORDER_TERMS,
        status: formData.status,
        createdAt: purchaseOrderToEdit
          ? purchaseOrderToEdit.createdAt
          : now,
        updatedAt: now,
      };

      await onSave(po);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Purchase Order ${po.purchaseOrderNumber} updated successfully`
          : `Purchase Order ${po.purchaseOrderNumber} issued successfully`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to persist purchase order to database");
    }
  };

  return (
    <EnterpriseWorkspace open={open} onClose={() => onOpenChange(false)}>
      <WorkspaceHeader
        title={isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
        subtitle="LATIFAL STAR TECHNICAL SERVICES • Materials & Services Procurement"
        documentNumber={formData.purchaseOrderNumber}
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
            {isEditing ? "Save Changes" : "Issue Purchase Order"}
          </Button>
        }
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceMain>
          <form id="po-form" onSubmit={handleSubmit} className="space-y-6">
            <WorkspaceSection title="Entity & Project Reference" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 bg-slate-50 p-3.5 rounded-md border border-slate-200">
                  <Select
                    label="Reference Existing Quotation (Optional)"
                    value={formData.quotationId}
                    onChange={(e) => handleQuotationSelect(e.target.value)}
                    options={[
                      { value: "", label: "-- None (Direct Purchase Order) --" },
                      ...quotations.map((q) => ({
                        value: q.id,
                        label: `${q.quotationNumber} â€” ${q.customerName} (${formatAED(q.grandTotal)})`,
                      })),
                    ]}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Selecting a quotation will automatically import vendor details, project scope, and item schedules.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <SearchableCustomerSelector
                    label="Select Client / Vendor / Entity"
                    required
                    value={formData.customerId}
                    onChange={handleCustomerSelect}
                    customers={customers}
                    error={errors.customerId}
                  />
                </div>

                <div>
                  <Input
                    label="Tax Registration Number (TRN)"
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
                    label="Purchase Order Subject / Scope"
                    required
                    placeholder="e.g. Procurement of Trane Chiller Spare Parts & Virgin R134a Refrigerant"
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
                    label="Delivery / Site Address"
                    placeholder="e.g. Airport Road, Al Garhoud, Dubai"
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryAddress: e.target.value })
                    }
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Schedule & Order Status" icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Purchase Order Date"
                    type="date"
                    required
                    value={formData.poDate}
                    onChange={(e) => {
                      const newPoDate = e.target.value;
                      const newDelivDate = calculateDeliveryDate(newPoDate, 14);
                      setFormData({
                        ...formData,
                        poDate: newPoDate,
                        expectedDeliveryDate: newDelivDate,
                      });
                    }}
                    error={errors.poDate}
                  />
                </div>

                <div>
                  <Input
                    label="Expected Delivery Date"
                    type="date"
                    required
                    value={formData.expectedDeliveryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedDeliveryDate: e.target.value,
                      })
                    }
                    error={errors.expectedDeliveryDate}
                  />
                </div>

                <div>
                  <Select allowCustom
                    label="Order Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as PurchaseOrderStatus,
                      })
                    }
                    options={[
                      { value: "ISSUED", label: "Issued (Confirmed Order)" },
                      { value: "DRAFT", label: "Draft (Under Review)" },
                      { value: "CANCELLED", label: "Cancelled / Void" },
                    ]}
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Procurement Items" icon={ClipboardList}>
              <LineItemsEditor items={items} onChange={setItems} />
              {errors.items && (
                <p className="text-xs text-red-600 font-medium mt-2">{errors.items}</p>
              )}
            </WorkspaceSection>

            <WorkspaceSection title="Procurement Terms & Delivery Instructions" icon={FileText}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Commercial Procurement Terms"
                  rows={5}
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, termsAndConditions: e.target.value })
                  }
                />
                <Textarea
                  label="Special Delivery / Gate Pass Notes"
                  placeholder="Gate pass requirements, offloading timing, safety induction..."
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
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Order Summary
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 font-numeric">
                  {formatAED(totals.subtotal)}
                </span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Discount:</span>
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
                <span className="font-bold text-[#002664] font-numeric">
                  {formatAED(totals.grandTotal)}
                </span>
              </div>
            </div>
            
            <div className="pt-2 text-xs text-slate-500 bg-blue-50/50 p-3 rounded-md border border-blue-100">
              <p className="font-semibold text-blue-800 mb-1">Procurement Note</p>
              Standard 5.00% UAE VAT applied to taxable items. Ensure vendor details and TRN are accurate.
            </div>
          </div>
        </WorkspaceSummaryPanel>
      </div>
    </EnterpriseWorkspace>
  );
}
