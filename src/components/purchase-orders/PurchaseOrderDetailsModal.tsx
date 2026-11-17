"use client";

import * as React from "react";
import Image from "next/image";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatAED, formatDate } from "@/lib/utils";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import { PDFService } from "@/lib/pdf";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import {
  PREEDHAR_COMPANY_DETAILS,
  type PurchaseOrderStatus,
} from "@/lib/purchase-orders/calculations";
import {
  Edit,
  Copy,
  RefreshCw,
  Printer,
  Download,
} from "lucide-react";

export function PurchaseOrderDetailsModal({
  open,
  onOpenChange,
  purchaseOrder,
  onEdit,
  onChangeStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
  onEdit: (po: PurchaseOrder) => void;
  onChangeStatus: (po: PurchaseOrder) => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
    }
  }, [open]);

  if (!purchaseOrder) return null;

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "ISSUED":
        return <Badge variant="navy" size="sm">Issued Order</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft Order</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  const toolbarActions = (
    <>
      <Button variant="toolbar"
        size="sm"
        leftIcon={<Printer className="w-3.5 h-3.5" />}
        onClick={() => setPreviewUrl(PDFService.previewPurchaseOrder(purchaseOrder))}
        title="Preview / Print Purchase Order PDF"
      >
        <span className="hidden sm:inline">Preview PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<Download className="w-3.5 h-3.5" />}
        onClick={() => PDFService.downloadPurchaseOrder(purchaseOrder)}
        title="Download Commercial Purchase Order PDF"
      >
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">Download</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        onClick={() => onChangeStatus(purchaseOrder)}
        className="hidden md:inline-flex"
      >
        Status
      </Button>

      <Button variant="secondary"
        size="sm"
        leftIcon={<Edit className="w-3.5 h-3.5" />}
        onClick={() => {
          onEdit(purchaseOrder);
        }}
      >
        Edit PO
      </Button>
    </>
  );

  return (
    <>
      <PDFPreviewModal
        open={!!previewUrl}
        onClose={() => { URL.revokeObjectURL(previewUrl!); setPreviewUrl(null); }}
        blobUrl={previewUrl}
        filename={`${purchaseOrder.purchaseOrderNumber}.pdf`}
      />
      <DocumentViewer
        open={open}
        onClose={() => onOpenChange(false)}
        documentType="Purchase Order"
        documentNumber={purchaseOrder.purchaseOrderNumber}
        statusBadges={getStatusBadge(purchaseOrder.status)}
        actions={toolbarActions}
      >
      {/* Header */}
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
              {" "}
              <span className="text-[#0052CC]">TECHNICAL SERVICES</span>
            </h2>
            
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-lg font-extrabold uppercase tracking-wider text-[#002664] block">
            PURCHASE ORDER
          </span>
          <span className="text-xs font-bold text-[#002664] font-numeric block mt-0.5">
            {purchaseOrder.purchaseOrderNumber}
          </span>
          {purchaseOrder.quotationNumber && (
            <span className="text-[11px] text-[#2563EB] font-semibold block font-numeric">
              Quotation Ref: {purchaseOrder.quotationNumber}
            </span>
          )}
          <span className="text-[11px] text-slate-500 block mt-1 font-numeric">
            PO Date: <strong>{formatDate(purchaseOrder.poDate)}</strong>
          </span>
          <span className="text-[11px] text-slate-500 block font-numeric">
            Expected Delivery: <strong>{formatDate(purchaseOrder.expectedDeliveryDate)}</strong>
          </span>
        </div>
      </div>

      {/* Vendor / Customer Information Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Issued To / Supplier Entity
          </span>
          <p className="text-sm font-bold text-slate-900">
            {purchaseOrder.clientPrintedName || purchaseOrder.customerName}
          </p>
          {purchaseOrder.customerTrn && (
            <p className="text-xs text-slate-700 font-numeric font-semibold">
              TRN: {purchaseOrder.customerTrn}
            </p>
          )}
          {purchaseOrder.attention && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Attn:</span> {purchaseOrder.attention}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Project & Delivery Location
          </span>
          <p className="text-xs font-bold text-slate-900">
            {purchaseOrder.projectName}
          </p>
          <p className="text-xs text-slate-600">
            {purchaseOrder.deliveryAddress || purchaseOrder.projectLocation}
          </p>
        </div>
      </div>

      {/* Scope Headline / Subject */}
      <div className="p-3 bg-white rounded-md border-l-4 border-l-[#002664] border border-slate-200 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">
          Procurement Scope / Requisition
        </span>
        <p className="text-xs font-bold text-[#002664] mt-0.5 leading-snug">
          {purchaseOrder.subject}
        </p>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Item Specification & Description</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Qty</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Unit</th>
              <th className="py-2.5 px-3 w-24 text-right border-r border-slate-200">Unit Rate (AED)</th>
              <th className="py-2.5 px-3 w-28 text-right">Amount (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {purchaseOrder.items.map((it, idx) => (
              <tr key={it.id || idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-semibold font-numeric text-slate-500">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 leading-relaxed">
                  <div className="font-semibold text-slate-900">{it.description}</div>
                  {it.discount > 0 && (
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      Supplier discount: -{formatAED(it.discount)}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-numeric font-medium">
                  {it.quantity}
                </td>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600 font-medium">
                  {it.unit}
                </td>
                <td className="py-2.5 px-3 text-right border-r border-slate-200 font-numeric text-slate-700">
                  {formatAED(it.unitPrice).replace("AED", "").trim()}
                </td>
                <td className="py-2.5 px-3 text-right font-bold font-numeric text-slate-900">
                  {formatAED(it.taxableAmount).replace("AED", "").trim()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
        <div className="space-y-2 flex-1 max-w-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Procurement Terms & Delivery Conditions
          </span>
          <pre className="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200">
            {purchaseOrder.termsAndConditions}
          </pre>
        </div>

        <div className="w-full sm:w-72 space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(purchaseOrder.subtotal)}
            </span>
          </div>
          {purchaseOrder.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span className="font-semibold font-numeric">
                -{formatAED(purchaseOrder.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxable Net:</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(purchaseOrder.taxableAmount)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>UAE VAT ({purchaseOrder.vatRate.toFixed(2)}%):</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(purchaseOrder.vatAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
            <span className="font-bold text-[#002664]">Total Order Value:</span>
            <span className="font-bold text-[#002664] font-numeric">
              {formatAED(purchaseOrder.grandTotal)}
            </span>
          </div>
        </div>
      </div>

    </DocumentViewer>
    </>
  );
}





