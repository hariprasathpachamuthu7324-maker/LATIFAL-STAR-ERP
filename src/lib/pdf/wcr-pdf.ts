import jsPDF from "jspdf";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import {
  PDF_COLORS,
  renderOfficialHeader,
  renderMetadataTable,
  renderOfficialFooter,
} from "./pdf-primitives";
import { formatDate } from "@/lib/utils";

export function generateWCRPDF(
  report: WorkCompletionReport,
  companyOverride?: Partial<{
    name: string;
    address: string;
    phone: string;
    email: string;
    trn: string;
  }>
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startX = 14;
  const usableWidth = doc.internal.pageSize.getWidth() - 28;

  // 1. Header
  let currentY = renderOfficialHeader(doc, "WORK COMPLETION REPORT", report.reportNumber, companyOverride, false);

  // 2. Metadata
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Completion No.",   value: report.reportNumber },
      { label: "Client / Customer",value: report.clientPrintedName || report.customerName },
      { label: "Location / Site",  value: report.projectLocation || "Dubai, UAE" },
      { label: "Quotation Ref.",   value: report.quotationNumber || "N/A" },
    ],
    [
      { label: "Date",           value: formatDate(report.workCompletionDate || report.reportDate) },
      { label: "Project",        value: report.projectName || "Technical Works" },
      { label: "Purchase Order", value: report.purchaseOrderNumber || "N/A" },
      { label: "Status",         value: report.status },
    ]
  );

  // Helper: draw a section header bar
  function drawSectionHeader(title: string, y: number): number {
    doc.setFillColor(...PDF_COLORS.tableLabelBg);
    doc.setDrawColor(...PDF_COLORS.tableBorder);
    doc.setLineWidth(0.25);
    doc.rect(startX, y, usableWidth, 6.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text(title, startX + 3, y + 4.5);
    return y + 7;
  }

  // 3. WORK DESCRIPTION
  if (currentY + 25 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }
  currentY = drawSectionHeader("WORK DESCRIPTION", currentY);

  const descText = report.workDescription || report.subject || null;
  const descWrapped = descText ? doc.splitTextToSize(descText, usableWidth - 6) : null;
  const descHeight = descWrapped ? Math.max(descWrapped.length * 4 + 4, 10) : 10;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, currentY, usableWidth, descHeight, "FD");

  if (descWrapped) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(descWrapped, startX + 3, currentY + 5);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text("No description provided.", startX + 3, currentY + 5);
  }
  currentY += descHeight + 4;

  // Separate Photos
  const beforePhotos = report.photos?.filter(p => p.category === "BEFORE" || !p.category) || [];
  const afterPhotos = report.photos?.filter(p => p.category === "AFTER") || [];

  // Helper to render a unified Work Section (Notes + Photos embedded together)
  const renderWorkSection = (title: string, noteText: string | null | undefined, sectionPhotos: any[]) => {
    if (currentY + 30 > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      currentY = 16;
    }
    currentY = drawSectionHeader(title, currentY);

    // If note text provided
    if (noteText && noteText.trim()) {
      const noteWrapped = doc.splitTextToSize(noteText.trim(), usableWidth - 6);
      const noteHeight = Math.max(noteWrapped.length * 4 + 4, 10);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...PDF_COLORS.tableBorder);
      doc.setLineWidth(0.25);
      doc.rect(startX, currentY, usableWidth, noteHeight, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_COLORS.textDark);
      doc.text(noteWrapped, startX + 3, currentY + 5);
      currentY += noteHeight + 3;
    }

    // Render Photos
    if (sectionPhotos.length > 0) {
      const photosPerRow = 2;
      const padding = 6;
      const boxWidth = (usableWidth - padding) / 2;
      const imgHeight = 62;
      let photoCount = 0;

      for (let i = 0; i < sectionPhotos.length; i++) {
        const p = sectionPhotos[i];
        if (photoCount > 0 && photoCount % photosPerRow === 0) {
          currentY += imgHeight + 12;
          if (currentY + imgHeight + 15 > doc.internal.pageSize.getHeight() - 15) {
            doc.addPage();
            currentY = 16;
          }
        }

        const isRightCol = photoCount % photosPerRow === 1;
        const x = startX + (isRightCol ? boxWidth + padding : 0);

        try {
          const source = p.dataUrl || p.url;
          if (!source) continue;

          let fmt = "JPEG";
          if (source.startsWith("data:image/png") || p.mimeType === "image/png") fmt = "PNG";
          else if (source.startsWith("data:image/webp") || p.mimeType === "image/webp") fmt = "WEBP";

          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.rect(x, currentY + 2, boxWidth, imgHeight);

          // Add image
          doc.addImage(source, fmt, x + 1, currentY + 3, boxWidth - 2, imgHeight - 2, undefined, "FAST");

          // Add caption
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(...PDF_COLORS.textDark);

          const captionText = p.caption || p.fileName || "Site Photo";
          const captionWrapped = doc.splitTextToSize(captionText, boxWidth - 2);
          doc.text(captionWrapped, x, currentY + imgHeight + 5);

          photoCount++;
        } catch {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(...PDF_COLORS.textMuted);
          doc.text("Image preview unavailable", x + 5, currentY + Math.floor(imgHeight / 2));
          photoCount++;
        }
      }

      if (photoCount > 0) {
        currentY += imgHeight + 12;
      }
    } else if (!noteText || !noteText.trim()) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.text("No photos attached for this section.", startX + 3, currentY + 5);
      currentY += 10;
    }
  };

  // 4. BEFORE WORK (Observations + Photos)
  renderWorkSection("BEFORE WORK", report.observations, beforePhotos);

  // 5. AFTER WORK (Completion Notes + Photos)
  renderWorkSection("AFTER WORK", (report as any).afterWorkNotes || report.materialsUsed, afterPhotos);

  // 6. REMARKS / NOTES
  if (currentY + 35 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }
  currentY = drawSectionHeader("REMARKS / NOTES", currentY);

  const remarksText = report.clientRemarks || report.notes || null;
  const remarksWrapped = remarksText ? doc.splitTextToSize(remarksText, usableWidth - 6) : null;
  const remarksHeight = remarksWrapped ? Math.max(remarksWrapped.length * 4 + 4, 10) : 10;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, currentY, usableWidth, remarksHeight, "FD");

  if (remarksWrapped) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(remarksWrapped, startX + 3, currentY + 5);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text("No remarks provided.", startX + 3, currentY + 5);
  }
  currentY += remarksHeight + 6;

  // 7. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
