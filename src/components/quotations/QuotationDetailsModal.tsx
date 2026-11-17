"use client";

import * as React from "react";
import Image from "next/image";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { formatAED, formatDate } from "@/lib/utils";
import type { Quotation } from "@/lib/data/quotations-mock";
import { PDFService } from "@/lib/pdf";
import {
  Edit,
  FileText,
  ClipboardCheck,
  Copy,
  RefreshCw,
  Printer,
  Download,
} from "lucide-react";

export function QuotationDetailsModal({
  open,
  onOpenChange,
  quotation,
  onEdit,
  onChangeStatus,
  onConvertToInvoice,
  onConvertToWCR,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation | null;
  onEdit: (quotation: Quotation) => void;
  onChangeStatus: (quotation: Quotation) => void;
  onConvertToInvoice?: (quotation: Quotation) => void;
  onConvertToWCR?: (quotation: Quotation) => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
    }
  }, [open]);

  if (!quotation) return null;

  const getStatusBadge = (status: Quotation["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success" dot size="sm">Accepted</Badge>;
      case "SENT":
        return <Badge variant="info" dot size="sm">Sent to Client</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft Proposal</Badge>;
      case "REJECTED":
        return <Badge variant="danger" dot size="sm">Rejected</Badge>;
      case "EXPIRED":
        return <Badge variant="warning" dot size="sm">Expired</Badge>;
    }
  };

  const toolbarActions = (
    <>
      <Button variant="toolbar"
        size="sm"
        leftIcon={<Printer className="w-3.5 h-3.5" />}
        onClick={() => setPreviewUrl(PDFService.previewQuotation(quotation))}
        title="Preview / Print PDF"
      >
        <span className="hidden sm:inline">Preview PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<Download className="w-3.5 h-3.5" />}
        onClick={() => PDFService.downloadQuotation(quotation)}
        title="Download Commercial Quotation PDF"
      >
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">Download</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        onClick={() => onChangeStatus(quotation)}
        className="hidden md:inline-flex"
      >
        Status
      </Button>

      {onConvertToInvoice && (
        <Button variant="toolbar"
          size="sm"
          leftIcon={<FileText className="w-3.5 h-3.5" />}
          onClick={() => onConvertToInvoice(quotation)}
          className="hidden lg:inline-flex"
          title="Convert to Invoice"
        >
          <span className="hidden xl:inline">Create Invoice</span>
          <span className="xl:hidden">Invoice</span>
        </Button>
      )}

      {onConvertToWCR && (
        <Button variant="toolbar"
          size="sm"
          leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}
          onClick={() => onConvertToWCR(quotation)}
          className="hidden lg:inline-flex"
          title="Convert to WCR"
        >
          <span className="hidden xl:inline">Create WCR</span>
          <span className="xl:hidden">WCR</span>
        </Button>
      )}

      <Button variant="secondary"
        size="sm"
        leftIcon={<Edit className="w-3.5 h-3.5" />}
        onClick={() => {
          onEdit(quotation);
        }}
      >
        Edit Quote
      </Button>
    </>
  );

  return (
    <>
      <PDFPreviewModal
        open={!!previewUrl}
        onClose={() => { URL.revokeObjectURL(previewUrl!); setPreviewUrl(null); }}
        blobUrl={previewUrl}
        filename={`${quotation.quotationNumber}.pdf`}
      />
      <DocumentViewer
        open={open}
        onClose={() => onOpenChange(false)}
        documentType="Quotation"
        documentNumber={quotation.quotationNumber}
        statusBadges={getStatusBadge(quotation.status)}
        actions={toolbarActions}
      >
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-white rounded-md p-1 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
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
              <span className="text-[#0052CC]"> TECHNICAL SERVICES</span>
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-base font-extrabold uppercase tracking-wider text-[#002664] block">
            QUOTATION
          </span>
          <span className="text-xs font-bold text-[#2563EB] font-numeric block mt-0.5">
            {quotation.quotationNumber}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1 font-numeric">
            Date: <strong>{formatDate(quotation.quotationDate)}</strong>
          </span>
          <span className="text-[11px] text-slate-500 block font-numeric">
            Valid Until: <strong>{formatDate(quotation.validUntil)}</strong>
          </span>
        </div>
      </div>

      {/* Client & Project Information Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Client Information
          </span>
          <p className="text-sm font-bold text-slate-900">
            {quotation.clientPrintedName || quotation.customerName}
          </p>
          {quotation.attention && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Attn:</span> {quotation.attention}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Project & Site Location
          </span>
          <p className="text-xs font-bold text-slate-900">
            {quotation.projectName}
          </p>
          <p className="text-xs text-slate-600">
            {quotation.projectLocation}
          </p>
        </div>
      </div>

      {/* Scope Headline / Subject */}
      <div className="p-3 bg-white rounded-md border-l-4 border-l-[#2563EB] border border-slate-200 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">
          Scope of Works / Subject
        </span>
        <p className="text-xs font-bold text-[#002664] mt-0.5 leading-snug">
          {quotation.subject}
        </p>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Description of Work / Bill of Quantities</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">Qty</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-right w-24">Rate (AED)</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-right w-20">Disc %</th>
              <th className="py-2.5 px-3 text-right w-28">Amount (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {quotation.items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 border-r border-slate-200 text-center font-numeric text-slate-500 font-medium">
                  {index + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200">
                  <div className="font-semibold text-slate-900">{item.description}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Unit: {item.unit}</div>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-center font-numeric font-medium">
                  {item.quantity}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-numeric">
                  {formatAED(item.unitPrice)}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-right font-numeric text-slate-500">
                  {item.discount > 0 ? formatAED(item.discount) : "—"}
                </td>
                <td className="py-2.5 px-3 text-right font-numeric font-semibold text-slate-900">
                  {formatAED(item.taxableAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary Calculation */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
        <div className="text-[11px] text-slate-500 space-y-1 max-w-sm">
          <p className="font-semibold text-slate-700">Commercial Notes & UAE VAT:</p>
          <p>• All prices quoted in United Arab Emirates Dirham (AED).</p>
          <p>• Standard 5.00% VAT applied as per UAE Federal Tax Authority (FTA) regulations.</p>
        </div>

        <div className="w-full sm:w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Net):</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(quotation.subtotal)}
            </span>
          </div>
          {quotation.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Total Discount:</span>
              <span className="font-semibold font-numeric">
                -{formatAED(quotation.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxable Net:</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(quotation.taxableAmount)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VAT ({quotation.vatRate.toFixed(2)}%):</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(quotation.vatAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
            <span className="font-bold text-[#002664]">Total Payable:</span>
            <span className="font-bold text-[#2563EB] font-numeric">
              {formatAED(quotation.grandTotal)}
            </span>
          </div>
        </div>
      </div>

    </DocumentViewer>
    </>
  );
}
