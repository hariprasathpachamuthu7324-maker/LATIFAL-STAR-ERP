"use client";

import * as React from "react";
import Image from "next/image";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import { WCRPhotoGallery } from "./WCRPhotoGallery";
import { PDFService } from "@/lib/pdf";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import {
  PREEDHAR_COMPANY_DETAILS,
  type WorkCompletionStatus,
} from "@/lib/work-completion/calculations";
import {
  Edit,
  Copy,
  RefreshCw,
  Printer,
  Download,
} from "lucide-react";

export function WorkCompletionDetailsModal({
  open,
  onOpenChange,
  report,
  onEdit,
  onChangeStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: WorkCompletionReport | null;
  onEdit: (report: WorkCompletionReport) => void;
  onChangeStatus: (report: WorkCompletionReport) => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
    }
  }, [open]);

  if (!report) return null;

  const getStatusBadge = (status: WorkCompletionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success" dot size="sm">Completed & Signed</Badge>;
      case "DRAFT":
        return <Badge variant="warning" dot size="sm">In Progress</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  const toolbarStatusBadges = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {getStatusBadge(report.status)}
      <span className="text-xs font-bold text-[#2563EB] font-numeric bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#DBEAFE]">
        {report.completionPercentage}% Complete
      </span>
    </div>
  );

  const toolbarActions = (
    <>
      <Button variant="toolbar"
        size="sm"
        leftIcon={<Printer className="w-3.5 h-3.5" />}
        onClick={() => setPreviewUrl(PDFService.previewWCR(report))}
        title="Preview / Print Work Completion Certificate PDF"
      >
        <span className="hidden sm:inline">Preview PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<Download className="w-3.5 h-3.5" />}
        onClick={() => PDFService.downloadWCR(report)}
        title="Download Work Completion Certificate PDF"
      >
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">Download</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        onClick={() => onChangeStatus(report)}
        className="hidden md:inline-flex"
      >
        Status
      </Button>

      <Button variant="secondary"
        size="sm"
        leftIcon={<Edit className="w-3.5 h-3.5" />}
        onClick={() => {
          onEdit(report);
        }}
      >
        Edit Report
      </Button>
    </>
  );

  return (
    <>
      <PDFPreviewModal
        open={!!previewUrl}
        onClose={() => { URL.revokeObjectURL(previewUrl!); setPreviewUrl(null); }}
        blobUrl={previewUrl}
        filename={`${report.reportNumber}.pdf`}
      />
      <DocumentViewer
        open={open}
        onClose={() => onOpenChange(false)}
        documentType="Work Completion Report"
        documentNumber={report.reportNumber}
        statusBadges={toolbarStatusBadges}
        actions={toolbarActions}
      >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded border border-slate-200 bg-white p-1 flex items-center justify-center">
            <Image
              src="/brand/latifal-star-logo.png"
              alt="LATIFAL STAR Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              <span className="text-[#002664]">LATIFAL STAR</span>
              {" "}
              <span className="text-[#0052CC]">TECHNICAL SERVICES</span>
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-lg font-extrabold uppercase tracking-wider text-[#002664] block">
            WORK COMPLETION REPORT
          </span>
          <span className="text-xs font-bold text-[#2563EB] font-numeric block mt-0.5">
            {report.reportNumber}
          </span>
          {report.purchaseOrderNumber && (
            <span className="text-[11px] text-[#002664] font-semibold block font-numeric">
              PO Ref: {report.purchaseOrderNumber}
            </span>
          )}
          {report.quotationNumber && (
            <span className="text-[11px] text-slate-500 block font-numeric">
              Quotation Ref: {report.quotationNumber}
            </span>
          )}
          <span className="text-[11px] text-slate-500 block mt-1 font-numeric">
            Report Date: <strong>{formatDate(report.reportDate)}</strong>
          </span>
        </div>
      </div>

      {/* Client & Project Information Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Client / Facility Details
          </span>
          <p className="text-sm font-bold text-slate-900">
            {report.clientPrintedName || report.customerName}
          </p>
          {report.customerTrn && (
            <p className="text-xs text-slate-700 font-numeric font-semibold">
              Client TRN: {report.customerTrn}
            </p>
          )}
          {report.attention && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Attn:</span> {report.attention}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Project & Site Location
          </span>
          <p className="text-xs font-bold text-slate-900">
            {report.projectName}
          </p>
          <p className="text-xs text-slate-600">
            {report.projectLocation}
          </p>
          <p className="text-[11px] text-slate-500 font-numeric">
            Execution: {formatDate(report.workStartDate)} → {formatDate(report.workCompletionDate)}
          </p>
        </div>
      </div>

      {/* Scope Headline */}
      <div className="p-3 bg-white rounded-md border-l-4 border-l-[#2563EB] border border-slate-200 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">
          Executed Work Scope
        </span>
        <p className="text-xs font-bold text-[#002664] mt-0.5 leading-snug">
          {report.subject}
        </p>
        {report.workDescription && (
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            {report.workDescription}
          </p>
        )}
      </div>

      {/* Executed Work Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Executed Activity & Specification</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Qty</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Unit</th>
              <th className="py-2.5 px-3 w-20 text-center border-r border-slate-200">Progress</th>
              <th className="py-2.5 px-3">Field Remarks / Test Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {report.items.map((it, idx) => (
              <tr key={it.id || idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-semibold font-numeric text-slate-500">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {it.description}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-numeric font-medium">
                  {it.quantity || "—"}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600 font-medium">
                  {it.unit || "LOT"}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-numeric font-bold text-emerald-700">
                  {it.completionPercentage}%
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                  {it.remarks || "Work verified and operational."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Observations & Materials Grid */}
      {(report.observations || report.materialsUsed) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.observations && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Engineering Test Readings & Observations
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {report.observations}
              </p>
            </div>
          )}
          {report.materialsUsed && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Replacement Materials & Consumables Log
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {report.materialsUsed}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Client Remarks */}
      {report.clientRemarks && (
        <div className="p-3 bg-[#FFF6EE]/60 rounded-lg border border-[#FFEDD5] space-y-1">
          <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider block">
            Client Inspection Feedback & Remarks
          </span>
          <p className="text-[11px] text-slate-800 leading-relaxed">
            {report.clientRemarks}
          </p>
        </div>
      )}

      {/* Site Inspection Photos Gallery */}
      <div className="pt-2 border-t border-slate-200">
        <WCRPhotoGallery photos={report.photos || []} />
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Handover Terms & Conditions
        </span>
        <pre className="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200">
          {report.termsAndConditions}
        </pre>
      </div>

    </DocumentViewer>
    </>
  );
}
