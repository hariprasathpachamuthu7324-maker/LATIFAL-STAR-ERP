import { invoices } from "./src/lib/data/invoices-mock";
import { PDFService } from "./src/lib/pdf";

const invoice = invoices.find(i => i.invoiceNumber === "PTS-INV-2026-001");
if (invoice) {
    console.log("Found invoice:", invoice.invoiceNumber);
    try {
        const url = PDFService.previewInvoice(invoice);
        console.log("Generated URL length:", url.length);
    } catch (e) {
        console.error("ERROR generating PDF:", e);
    }
}
