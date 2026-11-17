import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PREEDHAR_LOGO_BASE64 } from "./logo-base64";
import { numberToWordsAED } from "./amount-to-words";

// LATIFAL STAR Official Brand Colors — extracted from official logo
export const PDF_COLORS = {
  primaryNavy:  [0, 38, 100]    as [number, number, number], // #002664 Deep Navy from logo
  brandOrange:  [0, 82, 204]    as [number, number, number], // #0052CC Royal Blue accent
  brandBlue:    [0, 82, 204]    as [number, number, number], // #0052CC link/accent blue
  textDark:     [15, 23, 42]    as [number, number, number], // #0F172A
  textMuted:    [100, 116, 139] as [number, number, number], // #64748B
  tableLabelBg: [235, 243, 252] as [number, number, number], // #EBF3FC light soft blue
  tableBodyBg:  [255, 255, 255] as [number, number, number], // white
  tableBorder:  [180, 200, 225] as [number, number, number], // #B4C8E1
  totalRowBg:   [235, 243, 252] as [number, number, number], // same as label bg for total row
  balanceBg:    [235, 245, 255] as [number, number, number], // soft blue tint for balance
  balanceText:  [0, 38, 100]    as [number, number, number], // #002664 deep navy
  wordsBg:      [235, 245, 255] as [number, number, number], // light blue for amount in words box
  footerLine:   [0, 38, 100]    as [number, number, number], // #002664 deep navy footer line
};

export const PDF_COMPANY_DETAILS = {
  name: "LATIFAL STAR TECHNICAL SERVICES",
  nameFirst: "LATIFAL STAR",                                     // primary part
  nameRest: "TECHNICAL SERVICES",                                // secondary part
  tagline: "Commercial Electro-Mechanical & Technical Services",
  address: "Deira, Port Saeed, Dubai – United Arab Emirates",
  phone: "+971561574740",
  email: "info@latifalstar.com",
  trn: "100234567800003",
  bankName: "Emirates NBD",
  accountName: "LATIFAL STAR TECHNICAL SERVICES",
  iban: "AE070260001012345678901",
  swift: "EBILAEADXXX",
};

function getLogoBytes(): Uint8Array {
  try {
    const cleanBase64 = PREEDHAR_LOGO_BASE64
      .replace(/^data:image\/[a-z]+;base64,/, "")
      .replace(/\s+/g, "");
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(cleanBase64, "base64"));
    }
    if (typeof atob === "function") {
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      return bytes;
    }
  } catch { /* fallback */ }
  return new Uint8Array();
}

/**
 * Draw two-tone company name: "LATIFAL STAR" in navy, rest in royal blue
 */
function drawTwoToneCompanyName(doc: jsPDF, x: number, y: number, fontSize: number): void {
  const comp = PDF_COMPANY_DETAILS;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);

  const starText = comp.nameFirst.trim();
  const techText = comp.nameRest.trim();
  const starWidth = doc.getTextWidth(starText);
  const gap = 4.5; // Clear gap between STAR and TECHNICAL (ex: star technical)

  // "LATIFAL STAR" in navy (blue)
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text(starText, x, y);

  // "TECHNICAL SERVICES" in royal blue with guaranteed clear gap
  doc.setTextColor(...PDF_COLORS.brandOrange);
  doc.text(techText, x + starWidth + gap, y);
}

/**
 * 1. HEADER: Official LATIFAL STAR document header
 * Prominent circular logo + two-tone company name with clear gap + divider + document title
 */
export function renderOfficialHeader(
  doc: jsPDF,
  documentTitle: string,
  _docNumber?: string,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>,
  showAddressInHeader?: boolean
): number {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;

  // Logo settings: prominent, high-res circular emblem
  const logoSize = 19;
  const logoY = 7;
  const logoSpacing = 5;
  const textX = startX + logoSize + logoSpacing;

  // Header font styling
  doc.setFont("helvetica", "bold");
  const fontSize = 17.5;
  doc.setFontSize(fontSize);

  const starText = comp.nameFirst.trim();
  const techText = comp.nameRest.trim();
  const starWidth = doc.getTextWidth(starText);
  const gap = 4.5; // Distinct space between STAR and TECHNICAL (ex: star technical)

  // Vertical alignment: vertically centered with the circular logo
  const headerCenterY = logoY + (logoSize / 2);
  const capHeight = fontSize * 0.3528 * 0.72; // ~4.4 mm
  const textY = headerCenterY + (capHeight / 2);

  // Draw Logo
  try {
    const logoBytes = getLogoBytes();
    const imgData = (logoBytes && logoBytes.length > 0) ? logoBytes : PREEDHAR_LOGO_BASE64;
    const fmt = PREEDHAR_LOGO_BASE64.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(imgData as string, fmt, startX, logoY, logoSize, logoSize, undefined, "FAST");
  } catch {
    doc.setFillColor(220, 230, 242);
    doc.rect(startX, logoY, logoSize, logoSize, "F");
  }

  // "LATIFAL STAR" in primary navy
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text(starText, textX, textY);

  // "TECHNICAL SERVICES" in royal blue with guaranteed clear gap
  doc.setTextColor(...PDF_COLORS.brandOrange);
  doc.text(techText, textX + starWidth + gap, textY);

  // Thin navy divider
  const dividerY = logoY + logoSize + 3; // 29 mm
  doc.setDrawColor(...PDF_COLORS.primaryNavy);
  doc.setLineWidth(0.5);
  doc.line(0, dividerY, pageWidth, dividerY);

  // FULL WIDTH title band — navy background, white bold text
  const titleBandY = dividerY;
  doc.setFillColor(...PDF_COLORS.primaryNavy);
  doc.rect(0, titleBandY, pageWidth, 9.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(documentTitle.toUpperCase(), pageWidth / 2, titleBandY + 6.5, { align: "center" });

  return titleBandY + 9.5 + 4; // ~42.5 mm
}

export interface MetadataPair {
  label: string;
  value: string;
}

/**
 * 2. METADATA TABLE
 * Two-column layout: [label | value | label | value]
 * Label cells: blue-grey bg, bold navy text
 * Value cells: white bg, navy text
 */
export function renderMetadataTable(
  doc: jsPDF,
  startY: number,
  leftPairs: MetadataPair[],
  rightPairs: MetadataPair[]
): number {
  const maxRows = Math.max(leftPairs.length, rightPairs.length);
  const bodyRows: string[][] = [];

  for (let i = 0; i < maxRows; i++) {
    const left  = leftPairs[i]  || { label: "", value: "" };
    const right = rightPairs[i] || { label: "", value: "" };
    bodyRows.push([left.label, left.value, right.label, right.value]);
  }

  autoTable(doc, {
    startY,
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.25,
    },
    columnStyles: {
      0: {
        cellWidth: 30,
        fillColor: PDF_COLORS.tableLabelBg,
        fontStyle: "bold",
        textColor: PDF_COLORS.primaryNavy,
      },
      1: {
        cellWidth: 61,
        fillColor: PDF_COLORS.tableBodyBg,
        textColor: PDF_COLORS.primaryNavy,
        fontStyle: "normal",
      },
      2: {
        cellWidth: 30,
        fillColor: PDF_COLORS.tableLabelBg,
        fontStyle: "bold",
        textColor: PDF_COLORS.primaryNavy,
      },
      3: {
        cellWidth: 61,
        fillColor: PDF_COLORS.tableBodyBg,
        textColor: PDF_COLORS.primaryNavy,
        fontStyle: "normal",
      },
    },
    tableWidth: 182,
    margin: { left: 14, right: 14 },
  });

  const lastTable = (doc as any).lastAutoTable;
  return lastTable ? lastTable.finalY + 4 : startY + 28;
}

/**
 * 3. FINANCIAL TOTALS BLOCK
 * Right-aligned summary table + Amount in Words box
 */
export function renderFinancialTotalsBlock(
  doc: jsPDF,
  startY: number,
  data: {
    subtotal: number;
    discount?: number;
    taxableAmount?: number;
    vatRate?: number;
    vatAmount: number;
    grandTotal: number;
    amountPaid?: number;
    outstandingAmount?: number;
  },
  isInvoice: boolean = false
): number {
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  type SummaryRow = { label: string; value: string; isTotal?: boolean; isBalance?: boolean };
  const summaryRows: SummaryRow[] = [];

  summaryRows.push({
    label: "Sub Total (AED)",
    value: formatCurrency(data.subtotal).replace("AED", "").trim(),
  });

  if (data.discount && data.discount > 0) {
    summaryRows.push({
      label: "Discount (AED)",
      value: `-${formatCurrency(data.discount).replace("AED", "").trim()}`,
    });
  }

  summaryRows.push({
    label: `VAT ${data.vatRate ? data.vatRate.toFixed(0) : "5"}% (AED)`,
    value: formatCurrency(data.vatAmount).replace("AED", "").trim(),
  });

  summaryRows.push({
    label: "TOTAL AMOUNT (AED)",
    value: formatCurrency(data.grandTotal).replace("AED", "").trim(),
    isTotal: true,
  });

  if (isInvoice) {
    if (data.amountPaid !== undefined && data.amountPaid > 0) {
      summaryRows.push({
        label: "Amount Paid (AED)",
        value: formatCurrency(data.amountPaid).replace("AED", "").trim(),
      });
    }
    summaryRows.push({
      label: "BALANCE DUE (AED)",
      value: formatCurrency(
        data.outstandingAmount !== undefined ? data.outstandingAmount : data.grandTotal
      ).replace("AED", "").trim(),
      isBalance: true,
    });
  }

  const boxWidth = 88;
  const boxX = startX + usableWidth - boxWidth;
  let currentY = startY;

  autoTable(doc, {
    startY: currentY,
    body: summaryRows.map((r) => [r.label, r.value]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.25,
    },
    columnStyles: {
      0: {
        cellWidth: 50,
        halign: "left",
        fontStyle: "bold",
        fillColor: PDF_COLORS.tableLabelBg,
        textColor: PDF_COLORS.primaryNavy,
      },
      1: {
        cellWidth: 38,
        halign: "right",
        fontStyle: "bold",
        textColor: PDF_COLORS.primaryNavy,
        fillColor: PDF_COLORS.tableBodyBg,
      },
    },
    didParseCell: (hookData) => {
      const row = summaryRows[hookData.row.index];
      if (row?.isTotal) {
        hookData.cell.styles.fillColor = PDF_COLORS.totalRowBg;
        hookData.cell.styles.textColor = PDF_COLORS.primaryNavy;
        hookData.cell.styles.fontSize = 8.5;
        hookData.cell.styles.fontStyle = "bold";
      }
      if (row?.isBalance) {
        hookData.cell.styles.fillColor = PDF_COLORS.balanceBg;
        hookData.cell.styles.textColor = PDF_COLORS.balanceText;
        hookData.cell.styles.fontSize = 8.5;
        hookData.cell.styles.fontStyle = "bold";
      }
    },
    tableWidth: boxWidth,
    margin: { left: boxX, right: startX },
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 3 : currentY + 32;

  // Amount in Words — light blue box, italic blue text
  const amountForWords = isInvoice
    ? (data.outstandingAmount !== undefined ? data.outstandingAmount : data.grandTotal)
    : data.grandTotal;
  const words = numberToWordsAED(amountForWords);

  doc.setFillColor(...PDF_COLORS.wordsBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, currentY, usableWidth, 7, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Amount in Words:", startX + 3, currentY + 4.8);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.brandBlue);
  doc.text(words, startX + 30, currentY + 4.8);

  return currentY + 10;
}

/**
 * 4. BANK REMITTANCE BLOCK
 */
export function renderBankRemittanceDetails(
  doc: jsPDF,
  startY: number,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): number {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, startY, usableWidth, 13, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Official Bank Remittance & Payment Details:", startX + 3, startY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.brandBlue);
  doc.text(
    `Beneficiary: ${comp.accountName} • Bank: ${comp.bankName}`,
    startX + 3,
    startY + 8.5
  );
  doc.text(
    `IBAN: ${comp.iban} • SWIFT: ${comp.swift} • Currency: AED`,
    startX + 3,
    startY + 12
  );

  return startY + 16;
}

/**
 * 5. SIGNATURE BLOCKS
 * Title (bold navy) → blank space for signature → line → label below line
 * No sub-text, clean and professional
 */
export function renderOfficialSignatureBlocks(
  doc: jsPDF,
  startY: number,
  options: {
    leftTitle?: string;
    leftLabel?: string;
    rightTitle?: string;
    rightLabel?: string;
    showRight?: boolean;
  }
): number {
  // Signatures not required for internal company use
  return startY;
}

/**
 * 6. FOOTER — orange + navy divider line, grey text, page number
 */
export function renderOfficialFooter(
  doc: jsPDF,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): void {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const totalPages = doc.getNumberOfPages();
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Two-tone footer line: left half orange, right half navy (matches screenshots)
    const midX = startX + usableWidth / 2;
    doc.setLineWidth(0.5);
    doc.setDrawColor(...PDF_COLORS.footerLine);
    doc.line(startX, pageHeight - 12, midX, pageHeight - 12);
    doc.setDrawColor(...PDF_COLORS.primaryNavy);
    doc.line(midX, pageHeight - 12, startX + usableWidth, pageHeight - 12);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(
      `${comp.name} | DUBAI – UAE | Mob: ${comp.phone} | Email: ${comp.email}`,
      startX,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, startX + usableWidth, pageHeight - 7, {
      align: "right",
    });
  }
}

// Expose formatDate for use by individual PDF generators
export { formatDate };
