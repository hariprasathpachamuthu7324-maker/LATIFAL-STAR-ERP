import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation } from "@/lib/data/quotations-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderCleanMetadataBlock,
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

  // 2. Clean Borderless Metadata (No box structure)
  currentY = renderCleanMetadataBlock(
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
    ]
  );

  // 3. Subject as a prominent separate line before Dear Sir
  const subjectValue = quotation.subject || quotation.projectName || "Scope of Works";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Subject :", startX, currentY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.brandOrange);
  const wrappedSubject = doc.splitTextToSize(subjectValue, usableWidth - 18);
  doc.text(wrappedSubject, startX + 16, currentY);

  const subjectLines = Array.isArray(wrappedSubject) ? wrappedSubject.length : 1;
  currentY += (subjectLines * 4.5) + 3;

  // 4. Salutation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Dear Sir,", startX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(
    "We are pleased to submit our quotation for the below mentioned scope of work.",
    startX,
    currentY
  );
  currentY += 6;

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

  // 6. Payment Terms & Commercial Conditions (Matches official company quotation template)
  const requiredTermsHeight = 85;
  if (currentY + requiredTermsHeight > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // Payment terms
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text("Payment terms:", startX, currentY);
  currentY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("60% cash Advance.", startX, currentY);
  currentY += 4.2;
  doc.text("40% cash After Completion of works.", startX, currentY);
  currentY += 6.5;

  // Validity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Validity: ", startX, currentY);
  const valLabelW = doc.getTextWidth("Validity: ");
  doc.setFont("helvetica", "normal");
  const valText = "Our offer is valid for your acceptance for a period of 20 days from the date quoted and there after subject to our confirmation.";
  const wrappedVal = doc.splitTextToSize(valText, usableWidth - valLabelW);
  doc.text(wrappedVal, startX + valLabelW, currentY);
  currentY += (Array.isArray(wrappedVal) ? wrappedVal.length * 4 : 4) + 2.5;

  // Commencement of work
  doc.setFont("helvetica", "bold");
  doc.text("Commencement of work: ", startX, currentY);
  const commLabelW = doc.getTextWidth("Commencement of work: ");
  doc.setFont("helvetica", "normal");
  doc.text("Cash/LPO.", startX + commLabelW, currentY);
  currentY += 6.5;

  // Note
  doc.setFont("helvetica", "bold");
  doc.text("Note; ", startX, currentY);
  const noteLabelW = doc.getTextWidth("Note; ");
  doc.setFont("helvetica", "normal");
  const noteText = 'This quotation is valid for 30 days. After 30 days, the prices may be change. If the prices change, we will send you an additional/new quotation."';
  const wrappedNote = doc.splitTextToSize(noteText, usableWidth - noteLabelW);
  doc.text(wrappedNote, startX + noteLabelW, currentY);
  currentY += (Array.isArray(wrappedNote) ? wrappedNote.length * 4 : 4) + 5;

  // Exclusions
  doc.setFont("helvetica", "bold");
  doc.text("Exclusions:", startX, currentY);
  currentY += 5;

  const exclusions = [
    "Any works other than the above-mentioned scope are excluded.",
    "Scaffolding and ladder.",
    "Work permit, HSE permit, Gate pass, Approvals, NOC, & all other permissions.",
    "Inspection, approvals, certification, fees, or any local authority and 3rd party requirements.",
    "Any changes other than the above BOQ."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  exclusions.forEach((item, idx) => {
    doc.text(`${idx + 1}.`, startX + 6, currentY);
    const wrappedItem = doc.splitTextToSize(item, usableWidth - 14);
    doc.text(wrappedItem, startX + 12, currentY);
    currentY += (Array.isArray(wrappedItem) ? wrappedItem.length * 4 : 4) + 1;
  });

  currentY += 6;

  // 7. Space for Official Seal & Thanks and Regards (Sign-off)
  const signoffHeight = 22 + 24;
  if (currentY + signoffHeight > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // Clear vertical space for stamping company seal
  currentY += 22;

  // Sign-off text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text("Thanks and Regards,", startX, currentY);
  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  doc.text(comp.name, startX, currentY);
  currentY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(comp.contactPerson || "Muthu", startX, currentY);
  currentY += 4.5;
  doc.text(comp.phone || "0561574740", startX, currentY);

  // 9. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
