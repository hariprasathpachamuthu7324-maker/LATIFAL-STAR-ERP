import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderFinancialTotalsBlock,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generatePurchaseOrderPDF(
  po: PurchaseOrder,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  // 1. Header
  let currentY = renderOfficialHeader(doc, "PURCHASE ORDER", po.purchaseOrderNumber, companyOverride, false);

  // 2. Metadata — 3 rows each side
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Supplier",   value: po.clientPrintedName || po.customerName },
      { label: "Project",    value: po.projectName },
      { label: "Quote Ref.", value: po.quotationNumber || "N/A" },
    ],
    [
      { label: "PO Number", value: po.purchaseOrderNumber },
      { label: "PO Date",   value: formatDate(po.poDate) },
      { label: "Status",    value: po.status },
    ]
  );

  // 3. Line Items Table
  const tableRows = po.items.map((item, i) => [
    (i + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "DESCRIPTION / SPECIFICATION", "QTY / UNIT", "UNIT RATE (AED)", "TOTAL (AED)"]],
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

  if (currentY + 60 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 4. Financial Totals
  currentY = renderFinancialTotalsBlock(doc, currentY, {
    subtotal:      po.subtotal,
    discount:      po.discount,
    taxableAmount: po.taxableAmount,
    vatRate:       po.vatRate || 5,
    vatAmount:     po.vatAmount,
    grandTotal:    po.grandTotal,
  }, false);

  // 5. Special Instructions — bold label, blue italic content
  if (currentY + 35 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Special Instructions / Delivery Terms:", startX, currentY + 2);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.brandBlue);
  const deliveryText =
    po.termsAndConditions ||
    `Delivery Site: ${po.deliveryAddress || po.projectLocation || "Dubai, UAE"}`;
  const wrappedDelivery = doc.splitTextToSize(deliveryText, usableWidth);
  doc.text(wrappedDelivery, startX, currentY + 7);
  currentY += (Array.isArray(wrappedDelivery) ? wrappedDelivery.length * 4.5 : 5) + 10;

  // 6. Two Signature Blocks
  if (currentY + 26 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 7. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
