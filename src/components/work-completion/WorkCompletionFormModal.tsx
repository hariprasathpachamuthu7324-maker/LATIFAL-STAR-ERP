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
import { WorkItemEditor } from "./WorkItemEditor";
import { WCRPhotoUploader } from "./WCRPhotoUploader";
import { generateUUID } from "@/lib/utils";
import { getNextDocNumber } from "@/lib/utils/doc-numbering";
import { SearchableCustomerSelector } from "@/components/customers/SearchableCustomerSelector";
import type { WCRPhotoAttachment } from "@/lib/storage/types";
import {
  calculateOverallCompletion,
  DEFAULT_WCR_TERMS,
  type WorkCompletionStatus,
  type WorkItem,
} from "@/lib/work-completion/calculations";
import type { Customer } from "@/lib/data/customers-mock";
import type { Quotation } from "@/lib/data/quotations-mock";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import type {
  WorkCompletionReport,
  ClientAcknowledgement,
} from "@/lib/data/work-completion-mock";
import {
  Building2,
  Calendar,
  Camera,
  ClipboardCheck,
  FileText,
  Save,
  UserCheck,
  Wrench,
} from "lucide-react";

export function WorkCompletionFormModal({
  open,
  onOpenChange,
  reportToEdit,
  initialData,
  customers,
  quotations,
  purchaseOrders,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportToEdit?: WorkCompletionReport | null;
  initialData?: any;
  customers: Customer[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  onSave: (savedReport: WorkCompletionReport) => void;
}) {
  const isEditing = !!reportToEdit;

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = React.useState({
    reportNumber: "",
    customerId: "",
    customerName: "",
    clientPrintedName: "",
    attention: "",
    customerTrn: "",
    purchaseOrderId: "",
    purchaseOrderNumber: "",
    quotationId: "",
    quotationNumber: "",
    reportDate: getTodayStr(),
    workStartDate: getTodayStr(),
    workCompletionDate: getTodayStr(),
    subject: "",
    projectName: "",
    projectLocation: "",
    workDescription: "",
    completionPercentage: 100,
    observations: "",
    materialsUsed: "",
    engineerInCharge: "Project Engineer",
    clientRemarks: "",
    clientRepName: "",
    clientDesignation: "Facility Engineer",
    clientContactPhone: "",
    acknowledgementStatus: "ACCEPTED" as ClientAcknowledgement["status"],
    notes: "",
    termsAndConditions: DEFAULT_WCR_TERMS,
    status: "COMPLETED" as WorkCompletionStatus,
  });

  const [items, setItems] = React.useState<WorkItem[]>([
    {
      id: "wcr-item-init",
      description: "",
      quantity: 1,
      unit: "NOS",
      status: "COMPLETED",
      completionPercentage: 100,
      remarks: "",
    },
  ]);

  const [photos, setPhotos] = React.useState<WCRPhotoAttachment[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
            if (reportToEdit) {
      setFormData({
        reportNumber: reportToEdit.reportNumber,
        customerId: reportToEdit.customerId,
        customerName: reportToEdit.customerName,
        clientPrintedName: reportToEdit.clientPrintedName || "",
        attention: reportToEdit.attention || "",
        customerTrn: reportToEdit.customerTrn || "",
        purchaseOrderId: reportToEdit.purchaseOrderId || "",
        purchaseOrderNumber: reportToEdit.purchaseOrderNumber || "",
        quotationId: reportToEdit.quotationId || "",
        quotationNumber: reportToEdit.quotationNumber || "",
        reportDate: reportToEdit.reportDate,
        workStartDate: reportToEdit.workStartDate,
        workCompletionDate: reportToEdit.workCompletionDate,
        subject: reportToEdit.subject,
        projectName: reportToEdit.projectName,
        projectLocation: reportToEdit.projectLocation,
        workDescription: reportToEdit.workDescription || "",
        completionPercentage: reportToEdit.completionPercentage,
        observations: reportToEdit.observations || "",
        materialsUsed: reportToEdit.materialsUsed || "",
        engineerInCharge: reportToEdit.engineerInCharge,
        clientRemarks: reportToEdit.clientRemarks || "",
        clientRepName: reportToEdit.clientAcknowledgement?.representativeName || "",
        clientDesignation: reportToEdit.clientAcknowledgement?.designation || "",
        clientContactPhone: reportToEdit.clientAcknowledgement?.contactPhone || "",
        status: reportToEdit.status,
      });
      setItems(reportToEdit.items || []);
      setPhotos(reportToEdit.photos || []);
    } else if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.items) {
        setItems(initialData.items);
      }
      if (initialData.photos) {
        setPhotos(initialData.photos);
      }
    } else {
      const defaultCust = customers[0];
      const today = getTodayStr();
      getNextDocNumber("work_completion").then((nextNum) => {
        setFormData((prev) => ({ ...prev, reportNumber: nextNum }));
      });
      setFormData({
        reportNumber: "Generating...",
        customerId: defaultCust?.id || "",
        customerName: defaultCust?.companyName || "",
        clientPrintedName: defaultCust?.companyName || "",
        attention: defaultCust ? defaultCust.contactPerson : "",
        customerTrn: defaultCust?.taxRegistrationNumber || "",
        purchaseOrderId: "",
        purchaseOrderNumber: "",
        quotationId: "",
        quotationNumber: "",
        reportDate: today,
        workStartDate: today,
        workCompletionDate: today,
        subject: "",
        projectName: "",
        projectLocation: defaultCust
          ? `${defaultCust.address || defaultCust.city}, UAE`
          : "Dubai, UAE",
        workDescription: "",
        completionPercentage: 100,
        observations: "",
        materialsUsed: "",
        engineerInCharge: "Project Engineer",
        clientRemarks: "",
        clientRepName: defaultCust ? defaultCust.contactPerson : "",
        clientDesignation: "Facility Engineer",
        clientContactPhone: defaultCust ? defaultCust.phone : "",
        acknowledgementStatus: "ACCEPTED",
        notes: "",
        termsAndConditions: DEFAULT_WCR_TERMS,
        status: "COMPLETED",
      });
      setPhotos([]);
      setItems([
        {
          id: "wcr-item-init",
          description: "",
          quantity: 1,
          unit: "NOS",
          status: "COMPLETED",
          completionPercentage: 100,
          remarks: "",
        },
      ]);
    }
    setErrors({});
  }, [reportToEdit,
  initialData, open, customers]);

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
        clientRepName: cust.contactPerson || "",
        clientContactPhone: cust.phone || "",
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
        clientRepName: "",
        clientContactPhone: "",
      }));
    }
  };

  const handlePurchaseOrderSelect = (poId: string) => {
    if (!poId) {
      setFormData((prev) => ({
        ...prev,
        purchaseOrderId: "",
        purchaseOrderNumber: "",
      }));
      return;
    }

    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const matchingCust = customers.find((c) => c.id === po.customerId);

      setFormData((prev) => ({
        ...prev,
        purchaseOrderId: po.id,
        purchaseOrderNumber: po.purchaseOrderNumber,
        quotationId: po.quotationId || prev.quotationId,
        quotationNumber: po.quotationNumber || prev.quotationNumber,
        customerId: po.customerId,
        customerName: po.customerName,
        clientPrintedName: po.clientPrintedName || po.customerName,
        attention: po.attention || matchingCust?.contactPerson || "",
        customerTrn: matchingCust?.taxRegistrationNumber || prev.customerTrn,
        subject: po.subject,
        projectName: po.projectName,
        projectLocation: po.projectLocation,
        workDescription: `Execution of works specified in Purchase Order ${po.purchaseOrderNumber}: ${po.subject}`,
      }));

      if (po.items && po.items.length > 0) {
        setItems(
          po.items.map((it, idx) => ({
            id: `wcr-item-${Date.now()}-${idx}`,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            status: "COMPLETED",
            completionPercentage: 100,
            remarks: "Installed and site tested.",
          }))
        );
      }

      toast.info(`Imported project data from PO ${po.purchaseOrderNumber}`);
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
        workDescription: `Execution of technical scope per Quotation ${quote.quotationNumber}: ${quote.subject}`,
      }));

      if (quote.items && quote.items.length > 0) {
        setItems(
          quote.items.map((it, idx) => ({
            id: `wcr-item-${Date.now()}-${idx}`,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            status: "COMPLETED",
            completionPercentage: 100,
            remarks: "Scope executed and verified.",
          }))
        );
      }

      toast.info(`Imported project scope from Quotation ${quote.quotationNumber}`);
    }
  };

  const handleItemsChange = (newItems: WorkItem[]) => {
    setItems(newItems);
    const avg = calculateOverallCompletion(newItems);
    setFormData((prev) => ({ ...prev, completionPercentage: avg }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerId) {
      errs.customerId = "Please select a client or project entity";
    }
    if (!formData.subject.trim()) {
      errs.subject = "Report subject / work headline is required";
    }
    if (!formData.reportDate) {
      errs.reportDate = "Report date is required";
    }
    if (!formData.workStartDate) {
      errs.workStartDate = "Work start date is required";
    }
    if (!formData.workCompletionDate) {
      errs.workCompletionDate = "Work completion date is required";
    }
    if (new Date(formData.workCompletionDate) < new Date(formData.workStartDate)) {
      errs.workCompletionDate = "Completion date cannot be earlier than start date";
    }
    if (items.length === 0) {
      errs.items = "At least one executed work item is required";
    } else {
      const emptyDesc = items.some((it) => !it.description.trim());
      if (emptyDesc) {
        errs.items = "All work items must have a technical description";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields and verify work items");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const report: WorkCompletionReport = {
        id: reportToEdit ? reportToEdit.id : generateUUID(),
        reportNumber: formData.reportNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        clientPrintedName: formData.clientPrintedName || formData.customerName,
        attention: formData.attention || undefined,
        customerTrn: formData.customerTrn || undefined,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        purchaseOrderNumber: formData.purchaseOrderNumber || undefined,
        quotationId: formData.quotationId || undefined,
        quotationNumber: formData.quotationNumber || undefined,
        reportDate: formData.reportDate,
        workStartDate: formData.workStartDate,
        workCompletionDate: formData.workCompletionDate,
        subject: formData.subject.trim(),
        projectName: formData.projectName.trim() || "Technical Services Execution",
        projectLocation: formData.projectLocation.trim() || "Dubai, UAE",
        workDescription: formData.workDescription.trim() || formData.subject.trim(),
        completionPercentage: formData.completionPercentage,
        items,
        photos: photos.length > 0 ? photos : undefined,
        observations: formData.observations.trim() || undefined,
        materialsUsed: formData.materialsUsed.trim() || undefined,
        engineerInCharge: formData.engineerInCharge.trim(),
        clientRemarks: formData.clientRemarks.trim() || undefined,
        clientAcknowledgement: formData.clientRepName.trim()
          ? {
              clientRepresentativeName: formData.clientRepName.trim(),
              designation: formData.clientDesignation.trim() || "Client Representative",
              contactPhone: formData.clientContactPhone.trim() || undefined,
              acknowledgementDate: formData.workCompletionDate,
              status: formData.acknowledgementStatus,
            }
          : undefined,
        notes: formData.notes.trim() || undefined,
        termsAndConditions: formData.termsAndConditions.trim() || DEFAULT_WCR_TERMS,
        status: formData.status,
        createdAt: reportToEdit ? reportToEdit.createdAt : now,
        updatedAt: now,
      };

      await onSave(report);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Work Completion Report ${report.reportNumber} updated successfully`
          : `Work Completion Report ${report.reportNumber} generated successfully`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to persist work completion report to database");
    }
  };

  return (
    <EnterpriseWorkspace open={open} onClose={() => onOpenChange(false)}>
      <WorkspaceHeader
        title={isEditing ? "Edit Work Completion Report" : "Create Work Completion Report (WCR)"}
        subtitle="LATIFAL STAR TECHNICAL SERVICES â€¢ Site Execution & Handover Sign-Off"
        documentNumber={formData.reportNumber}
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
            {isEditing ? "Save Changes" : "Issue Certificate"}
          </Button>
        }
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceMain>
          <form id="wcr-form" onSubmit={handleSubmit} className="space-y-6">
            <WorkspaceSection title="Client & Commercial Links" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 bg-slate-50 p-3.5 rounded-md border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Reference Purchase Order (Optional)"
                      value={formData.purchaseOrderId}
                      onChange={(e) => handlePurchaseOrderSelect(e.target.value)}
                      options={[
                        { value: "", label: "-- None (Direct Site Execution) --" },
                        ...purchaseOrders.map((p) => ({
                          value: p.id,
                          label: `${p.purchaseOrderNumber} â€” ${p.customerName}`,
                        })),
                      ]}
                    />

                    <Select
                      label="Reference Quotation (Optional)"
                      value={formData.quotationId}
                      onChange={(e) => handleQuotationSelect(e.target.value)}
                      options={[
                        { value: "", label: "-- None (Direct Requisition) --" },
                        ...quotations.map((q) => ({
                          value: q.id,
                          label: `${q.quotationNumber} â€” ${q.customerName}`,
                        })),
                      ]}
                    />
                  </div>
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
                    label="Client TRN"
                    placeholder="e.g. 100234567800003"
                    value={formData.customerTrn}
                    onChange={(e) =>
                      setFormData({ ...formData, customerTrn: e.target.value })
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Report Subject / Work Headline"
                    required
                    placeholder="e.g. Overhaul of 300TR Trane Water-Cooled Chiller Unit #2"
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

                <div className="sm:col-span-3">
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

            <WorkspaceSection title="Execution Schedule" icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <Input
                    label="Report Date"
                    type="date"
                    required
                    value={formData.reportDate}
                    onChange={(e) =>
                      setFormData({ ...formData, reportDate: e.target.value })
                    }
                    error={errors.reportDate}
                  />
                </div>

                <div>
                  <Input
                    label="Work Start Date"
                    type="date"
                    required
                    value={formData.workStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, workStartDate: e.target.value })
                    }
                    error={errors.workStartDate}
                  />
                </div>

                <div>
                  <Input
                    label="Work Completion Date"
                    type="date"
                    required
                    value={formData.workCompletionDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workCompletionDate: e.target.value,
                      })
                    }
                    error={errors.workCompletionDate}
                  />
                </div>

                <div>
                  <Select allowCustom
                    label="Report Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as WorkCompletionStatus,
                      })
                    }
                    options={[
                      { value: "COMPLETED", label: "Completed & Signed" },
                      { value: "DRAFT", label: "Draft / In-Progress" },
                      { value: "CANCELLED", label: "Cancelled" },
                    ]}
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Work Description & Itemized Schedule" icon={ClipboardCheck}>
              <div className="space-y-4">
                <Textarea
                  label="General Execution Description / Executive Summary"
                  rows={3}
                  placeholder="Detail the technical actions, teardown, testing procedures, and commissioning results..."
                  value={formData.workDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, workDescription: e.target.value })
                  }
                />
                
                <WorkItemEditor
                  items={items}
                  onChange={handleItemsChange}
                />
                {errors.items && (
                  <p className="text-xs text-red-600 font-medium">{errors.items}</p>
                )}
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Materials & Equipment Utilized" icon={Wrench}>
              <Textarea
                label="Installed Parts, Spare Components, or Raw Materials"
                rows={3}
                placeholder="OEM kits, refrigerant cylinders, lubricants, gaskets installed..."
                value={formData.materialsUsed}
                onChange={(e) =>
                  setFormData({ ...formData, materialsUsed: e.target.value })
                }
              />
            </WorkspaceSection>

                        <WorkspaceSection title="Before Work Photos" icon={Camera}>
              <WCRPhotoUploader
                reportId={reportToEdit ? reportToEdit.id : formData.reportNumber}
                category="BEFORE"
                photos={photos.filter(p => p.category === 'BEFORE' || !p.category)}
                onChange={(newBefore) => {
                  const others = photos.filter(p => p.category === 'AFTER');
                  setPhotos([...others, ...newBefore]);
                }}
              />
            </WorkspaceSection>

            <WorkspaceSection title="After Work Photos" icon={Camera}>
              <WCRPhotoUploader
                reportId={reportToEdit ? reportToEdit.id : formData.reportNumber}
                category="AFTER"
                photos={photos.filter(p => p.category === 'AFTER')}
                onChange={(newAfter) => {
                  const others = photos.filter(p => p.category === 'BEFORE' || !p.category);
                  setPhotos([...others, ...newAfter]);
                }}
              />
            </WorkspaceSection>

            <WorkspaceSection title="Engineer & Client Sign-Off Details" icon={UserCheck}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="LATIFAL STAR Lead Engineer In-Charge"
                    value={formData.engineerInCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineerInCharge: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Client Representative Name"
                    placeholder="e.g. Eng. Tariq Mansoor"
                    value={formData.clientRepName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientRepName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Client Designation"
                    placeholder="e.g. Project Manager / FM Director"
                    value={formData.clientDesignation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientDesignation: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="sm:col-span-3">
                  <Textarea
                    label="Client Feedback & Inspection Remarks"
                    rows={3}
                    placeholder="Client acceptance confirmation, minor punch list notes, or handover observations..."
                    value={formData.clientRemarks}
                    onChange={(e) =>
                      setFormData({ ...formData, clientRemarks: e.target.value })
                    }
                  />
                </div>
              </div>
            </WorkspaceSection>
          </form>
        </WorkspaceMain>

        <WorkspaceSummaryPanel>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Handover Progress
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#002664]">Overall Completion:</span>
                  <span className="font-bold text-lg text-[#2563EB] font-numeric">
                    {formData.completionPercentage}%
                  </span>
                </div>
                
                <div className="w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.completionPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        completionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                  />
                </div>
                
                <p className="text-xs text-slate-500 mt-2">
                  Use the slider to override the calculated overall completion percentage, or let it automatically calculate based on line items.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                Supporting Documentation
              </h3>
              
              <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Attached Photos:</span>
                  <span className="font-semibold text-slate-800 font-numeric">{photos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Line Items:</span>
                  <span className="font-semibold text-slate-800 font-numeric">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-semibold text-slate-800">{formData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </WorkspaceSummaryPanel>
      </div>
    </EnterpriseWorkspace>
  );
}



