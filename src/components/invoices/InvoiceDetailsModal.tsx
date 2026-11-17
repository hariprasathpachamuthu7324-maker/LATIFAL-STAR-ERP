"use client";

import * as React from "react";
import Image from "next/image";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { formatAED, formatDate } from "@/lib/utils";
import type { Invoice } from "@/lib/data/invoices-mock";
import { PDFService } from "@/lib/pdf";
import {
  LATIFAL_STAR_COMPANY_DETAILS,
  type InvoiceDocumentStatus,
  type InvoicePaymentStatus,
} from "@/lib/invoices/calculations";
import {
  Edit,
  Copy,
  RefreshCw,
  CreditCard,
  Printer,
  Download,
} from "lucide-react";

export function InvoiceDetailsModal({
  open,
  onOpenChange,
  invoice,
  onEdit,
  onChangeStatus,
  onUpdatePayment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEdit: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
  onUpdatePayment: (invoice: Invoice) => void;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
    }
  }, [open]);

  if (!invoice) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDue =
    new Date(invoice.dueDate) < today &&
    invoice.outstandingAmount > 0 &&
    invoice.status === "ISSUED";

  const getDocStatusBadge = (status: InvoiceDocumentStatus) => {
    switch (status) {
      case "ISSUED":
        return <Badge variant="navy" size="sm">Issued</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  const getPaymentBadge = (status: InvoicePaymentStatus) => {
    if (status === "PAID") {
      return <Badge variant="success" dot size="sm">Paid in Full</Badge>;
    }
    if (status === "OVERDUE" || isPastDue) {
      return <Badge variant="danger" dot size="sm">Overdue</Badge>;
    }
    if (status === "PARTIALLY_PAID") {
      return <Badge variant="warning" dot size="sm">Partially Paid</Badge>;
    }
    return <Badge variant="info" dot size="sm">Payment Pending</Badge>;
  };

  const toolbarStatusBadges = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {getDocStatusBadge(invoice.status)}
      {getPaymentBadge(invoice.paymentStatus)}
    </div>
  );

  const toolbarActions = (
    <>
      <Button variant="toolbar"
        size="sm"
        leftIcon={<Printer className="w-3.5 h-3.5" />}
        onClick={() => setPreviewUrl(PDFService.previewInvoice(invoice))}
        title="Preview / Print Tax Invoice PDF"
      >
        <span className="hidden sm:inline">Preview PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<Download className="w-3.5 h-3.5" />}
        onClick={() => PDFService.downloadInvoice(invoice)}
        title="Download Official Tax Invoice PDF"
      >
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">Download</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
        onClick={() => {
          setTimeout(() => onUpdatePayment(invoice), 80);
        }}
      >
        <span className="hidden md:inline">Record Payment</span>
        <span className="md:hidden">Payment</span>
      </Button>

      <Button variant="toolbar"
        size="sm"
        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        onClick={() => onChangeStatus(invoice)}
        className="hidden md:inline-flex"
      >
        Status
      </Button>

      <Button variant="secondary"
        size="sm"
        leftIcon={<Edit className="w-3.5 h-3.5" />}
        onClick={() => {
          onEdit(invoice);
        }}
      >
        Edit Invoice
      </Button>
    </>
  );

  return (
    <>
      <PDFPreviewModal
        open={!!previewUrl}
        onClose={() => { URL.revokeObjectURL(previewUrl!); setPreviewUrl(null); }}
        blobUrl={previewUrl}
        filename={`${invoice.invoiceNumber}.pdf`}
      />
      <DocumentViewer
        open={open}
        onClose={() => onOpenChange(false)}
        documentType="Tax Invoice"
        documentNumber={invoice.invoiceNumber}
        statusBadges={toolbarStatusBadges}
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
              <span className="text-[#0052CC]"> TECHNICAL SERVICES</span>
            </h2>
            
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-lg font-extrabold uppercase tracking-wider text-[#002664] block">
            TAX INVOICE
          </span>
          <span className="text-xs font-bold text-[#002664] font-numeric block mt-0.5">
            {invoice.invoiceNumber}
          </span>
          {invoice.quotationNumber && (
            <span className="text-[11px] text-[#2563EB] font-semibold block font-numeric">
              Quotation Ref: {invoice.quotationNumber}
            </span>
          )}
          <span className="text-[11px] text-slate-500 block mt-1 font-numeric">
            Date: <strong>{formatDate(invoice.invoiceDate)}</strong>
          </span>
          <span className="text-[11px] text-slate-500 block font-numeric">
            Due Date: <strong>{formatDate(invoice.dueDate)}</strong> ({invoice.paymentTerms})
          </span>
        </div>
      </div>

      {/* Client & Project Information Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Billed To (Client Details)
          </span>
          <p className="text-sm font-bold text-slate-900">
            {invoice.clientPrintedName || invoice.customerName}
          </p>
          {invoice.customerTrn && (
            <p className="text-xs text-slate-700 font-numeric font-semibold">
              Client TRN: {invoice.customerTrn}
            </p>
          )}
          {invoice.attention && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Attn:</span> {invoice.attention}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Project & Job Location
          </span>
          <p className="text-xs font-bold text-slate-900">
            {invoice.projectName}
          </p>
          <p className="text-xs text-slate-600">
            {invoice.projectLocation}
          </p>
        </div>
      </div>

      {/* Scope Headline / Subject */}
      <div className="p-3 bg-white rounded-md border-l-4 border-l-[#2563EB] border border-slate-200 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">
          Scope of Works / Technical Services
        </span>
        <p className="text-xs font-bold text-[#002664] mt-0.5 leading-snug">
          {invoice.subject}
        </p>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Description of Technical Execution</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Qty</th>
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Unit</th>
              <th className="py-2.5 px-3 w-24 text-right border-r border-slate-200">Rate (AED)</th>
              <th className="py-2.5 px-3 w-28 text-right">Amount (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {invoice.items.map((it, idx) => (
              <tr key={it.id || idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-center border-r border-slate-200 font-semibold font-numeric text-slate-500">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 leading-relaxed">
                  <div className="font-semibold text-slate-900">{it.description}</div>
                  {it.discount > 0 && (
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      Line discount: -{formatAED(it.discount)}
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

      {/* Totals & Payment Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
        {/* Bank Transfer Coordinates */}
        <div className="space-y-2 flex-1 max-w-md bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Direct Bank Remittance Coordinates
          </span>
          <div className="grid grid-cols-2 gap-y-1 text-slate-700">
            <span className="text-slate-500">Beneficiary:</span>
            <span className="font-semibold">{LATIFAL_STAR_COMPANY_DETAILS.accountName}</span>
            <span className="text-slate-500">Bank:</span>
            <span className="font-semibold">{LATIFAL_STAR_COMPANY_DETAILS.bankName}</span>
            <span className="text-slate-500">Branch:</span>
            <span>{LATIFAL_STAR_COMPANY_DETAILS.bankBranch}</span>
            <span className="text-slate-500">IBAN:</span>
            <span className="font-mono font-bold text-[#002664]">{LATIFAL_STAR_COMPANY_DETAILS.iban}</span>
            <span className="text-slate-500">SWIFT / BIC:</span>
            <span className="font-mono font-semibold">{LATIFAL_STAR_COMPANY_DETAILS.swiftCode}</span>
          </div>
        </div>

        {/* Financial Totals & Balance */}
        <div className="w-full sm:w-72 space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(invoice.subtotal)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span className="font-semibold font-numeric">
                -{formatAED(invoice.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxable Net:</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(invoice.taxableAmount)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>UAE VAT ({invoice.vatRate.toFixed(2)}%):</span>
            <span className="font-semibold text-slate-800 font-numeric">
              {formatAED(invoice.vatAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
            <span className="font-bold text-[#002664]">Total Payable:</span>
            <span className="font-bold text-[#002664] font-numeric">
              {formatAED(invoice.grandTotal)}
            </span>
          </div>

          {/* Payments tracking */}
          <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-300 text-emerald-700">
            <span>Amount Paid:</span>
            <span className="font-semibold font-numeric">
              {formatAED(invoice.amountPaid)}
            </span>
          </div>

          <div className="flex justify-between pt-1 border-t border-slate-300 text-xs font-bold text-amber-700">
            <span>Outstanding Balance:</span>
            <span className="font-numeric">
              {formatAED(invoice.outstandingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-1 pt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Commercial Terms & Notes
        </span>
        <pre className="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-200">
          {invoice.termsAndConditions}
        </pre>
      </div>

    </DocumentViewer>
    </>
  );
}






