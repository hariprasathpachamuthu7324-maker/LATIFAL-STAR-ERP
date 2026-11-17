import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/lib/data/invoices-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderFinancialTotalsBlock,
  renderBankRemittanceDetails,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateInvoicePDF(
  invoice: Invoice,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  // 1. Full header with address/TRN (invoice style)
  let currentY = renderOfficialHeader(doc, "TAX INVOICE", invoice.invoiceNumber, companyOverride, true);

  // 2. Metadata — 5 rows each side
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Customer",       value: invoice.clientPrintedName || invoice.customerName },
      { label: "Contact",        value: invoice.attention || "" },
      { label: "Project",        value: invoice.projectName || "" },
      { label: "Site / Location",value: invoice.projectLocation || "Dubai, UAE" },
      { label: "Company TRN",    value: invoice.customerTrn || "N/A" },
    ],
    [
      { label: "Invoice No.",     value: invoice.invoiceNumber },
      { label: "Invoice Date",    value: formatDate(invoice.invoiceDate) },
      { label: "Due Date",        value: formatDate(invoice.dueDate) },
      { label: "Quote Ref.",      value: invoice.quotationNumber || "N/A" },
      { label: "Payment Status",  value: invoice.paymentStatus || "UNPAID" },
    ]
  );

  // 3. Line Items Table
  const tableRows = invoice.items.map((item, i) => [
    (i + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "DESCRIPTION", "QTY / UNIT", "UNIT PRICE (AED)", "AMOUNT (AED)"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: PDF_COLORS.primaryNavy,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: PDF_COLORS.primaryNavy,
      cellPadding: 2.2,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.25,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left",   cellWidth: "auto" },
      2: { halign: "center", cellWidth: 26 },
      3: { halign: "right",  cellWidth: 32 },
      4: { halign: "right",  cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: startX, right: startX },
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 4 : currentY + 35;

  if (currentY + 70 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 4. Financial Totals (with balance due, optional amount paid)
  currentY = renderFinancialTotalsBlock(doc, currentY, {
    subtotal:        invoice.subtotal,
    discount:        invoice.discount,
    taxableAmount:   invoice.taxableAmount,
    vatRate:         invoice.vatRate || 5,
    vatAmount:       invoice.vatAmount,
    grandTotal:      invoice.grandTotal,
    amountPaid:      invoice.amountPaid,
    outstandingAmount: invoice.outstandingAmount,
  }, true);

  if (currentY + 45 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 5. Bank remittance — only for fully unpaid invoices
  const isPaid = (invoice.amountPaid || 0) > 0;
  if (!isPaid) {
    currentY = renderBankRemittanceDetails(doc, currentY, companyOverride);
  }

  // 6. Remarks / Payment Terms
  const remarks = invoice.notes || invoice.termsAndConditions;
  if (remarks) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text("Remarks / Payment Terms:", startX, currentY + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.brandBlue);
    const remarkLines = remarks.split("\n").filter(Boolean);
    let remY = currentY + 7;
    if (remarkLines.length > 1) {
      remarkLines.forEach((line, idx) => {
        doc.text(`${idx + 1}. ${line.replace(/^\d+\.\s*/, "")}`, startX, remY);
        remY += 4.5;
      });
    } else {
      const wrapped = doc.splitTextToSize(remarks, usableWidth);
      doc.text(wrapped, startX, remY);
      remY += (Array.isArray(wrapped) ? wrapped.length * 4 : 4);
    }
    currentY = remY + 4;
  }

  // 7. Remarks / Payment Instructions (for partially paid)
  if (isPaid && invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text("Remarks / Payment Instructions:", startX, currentY + 2);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.brandBlue);
    const wrapped = doc.splitTextToSize(invoice.notes, usableWidth);
    doc.text(wrapped, startX, currentY + 7);
    currentY += (Array.isArray(wrapped) ? wrapped.length * 4 : 4) + 12;
  }

  // 8. Sign-off + single signature
  if (currentY + 26 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 9. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
