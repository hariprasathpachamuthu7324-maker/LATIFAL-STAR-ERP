import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation } from "@/lib/data/quotations-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderFinancialTotalsBlock,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateQuotationPDF(
  quotation: Quotation,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  // 1. Header (no address lines)
  let currentY = renderOfficialHeader(doc, "QUOTATION", quotation.quotationNumber, companyOverride, false);

  // 2. Metadata Table
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Company", value: quotation.clientPrintedName || quotation.customerName },
      { label: "Attn",    value: quotation.attention || "Manager / Project In-Charge" },
      { label: "Site",    value: quotation.projectLocation || "Dubai, UAE" },
      { label: "Contact", value: quotation.contactPhone
          ? `${quotation.contactPhone}${quotation.contactEmail ? ", " + quotation.contactEmail : ""}`
          : (quotation.attention || "Dubai, UAE") },
    ],
    [
      { label: "Ref. No.", value: quotation.quotationNumber },
      { label: "Date",     value: formatDate(quotation.quotationDate) },
      { label: "Project",  value: quotation.projectName || "Technical Services" },
      { label: "Subject",  value: quotation.subject || "Scope of Works" },
    ]
  );

  // 3. Salutation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Dear Sir,", startX, currentY + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(
    "We are pleased to submit our quotation for the below mentioned scope of work.",
    startX,
    currentY + 8
  );
  currentY += 12;

  // 4. Line Items Table
  const tableRows = quotation.items.map((item, i) => [
    (i + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "DESCRIPTION", "QTY / UNIT", "UNIT RATE (AED)", "TOTAL (AED)"]],
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

  if (currentY + 65 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 5. Financial Totals
  currentY = renderFinancialTotalsBlock(doc, currentY, {
    subtotal:     quotation.subtotal,
    discount:     quotation.discount,
    taxableAmount: quotation.taxableAmount,
    vatRate:      quotation.vatRate || 5,
    vatAmount:    quotation.vatAmount,
    grandTotal:   quotation.grandTotal,
  }, false);

  // 6. Terms & Conditions
  if (currentY + 40 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("TERMS & CONDITIONS", startX, currentY + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textDark);

  const rawTerms =
    quotation.termsAndConditions ||
    "Payment Terms: 60% cash Advance, 40% cash After Completion of works\nQuote Validity: 20 days\nCommencement of Work: Cash / LPO";

  const termsLines = rawTerms.split("\n").filter(Boolean);
  let termY = currentY + 7;
  for (const line of termsLines) {
    doc.text(`\u2022 ${line.replace(/^[\u2022\-]\s*/, "")}`, startX, termY);
    termY += 4.5;
  }
  currentY = termY + 2;

  // 7. Exclusions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("EXCLUSIONS:", startX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  const excl = doc.splitTextToSize(
    "Any works, materials or services not specifically mentioned in the above scope are excluded from this quotation.",
    usableWidth
  );
  doc.text(excl, startX, currentY + 4.5);
  currentY += (Array.isArray(excl) ? excl.length * 4 : 4) + 8;

  // 8. Sign-off + single signature
  if (currentY + 28 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 9. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
