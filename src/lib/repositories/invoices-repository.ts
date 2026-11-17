import { createClient } from "@/lib/supabase/client";
import { isValidUUID, generateUUID } from "@/lib/utils";
import type { Invoice } from "@/lib/data/invoices-mock";

export const InvoicesRepository = {
  async getAll(): Promise<Invoice[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        clientPrintedName: row.client_printed_name || undefined,
        attention: row.attention || undefined,
        customerTrn: row.customer_trn || undefined,
        quotationId: row.quotation_id || undefined,
        quotationNumber: row.quotation_number || undefined,
        invoiceDate: row.invoice_date,
        dueDate: row.due_date,
        paymentTerms: row.payment_terms,
        subject: row.subject,
        projectName: row.project_name,
        projectLocation: row.project_location,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        taxableAmount: Number(row.taxable_amount),
        vatRate: Number(row.vat_rate),
        vatAmount: Number(row.vat_amount),
        grandTotal: Number(row.grand_total),
        amountPaid: Number(row.amount_paid || 0),
        outstandingAmount: Number(row.outstanding_amount || 0),
        notes: row.notes || undefined,
        termsAndConditions: row.terms_and_conditions,
        status: row.status as Invoice["status"],
        paymentStatus: row.payment_status as Invoice["paymentStatus"],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: (row.invoice_items || [])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPrice: Number(item.unit_price),
            discount: Number(item.discount),
            taxableAmount: Number(item.taxable_amount),
            vatAmount: Number(item.vat_amount),
            total: Number(item.total ?? item.total_price ?? 0),
          })),
      }));
    } catch (err) {
      return [];
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    if (!id) return null;
    const list = await this.getAll();
    return list.find((inv) => inv.id === id) || null;
  },

  async save(invoice: Invoice): Promise<Invoice> {
    const supabase = createClient();
    const resolvedId = isValidUUID(invoice.id) ? invoice.id : generateUUID();
    const resolvedQuotationId = isValidUUID(invoice.quotationId) ? invoice.quotationId : null;
    const resolvedItems = (invoice.items || []).map((item) => ({
      ...item,
      id: isValidUUID(item.id) ? item.id : generateUUID(),
    }));

    const invoiceToSave: Invoice = {
      ...invoice,
      id: resolvedId,
      quotationId: resolvedQuotationId || undefined,
      items: resolvedItems,
    };

    const { error: invErr } = await supabase.from("invoices").upsert({
      id: resolvedId,
      invoice_number: invoiceToSave.invoiceNumber,
      customer_id: invoiceToSave.customerId,
      customer_name: invoiceToSave.customerName,
      client_printed_name: invoiceToSave.clientPrintedName || null,
      attention: invoiceToSave.attention || null,
      customer_trn: invoiceToSave.customerTrn || null,
      quotation_id: resolvedQuotationId,
      quotation_number: invoiceToSave.quotationNumber || null,
      invoice_date: invoiceToSave.invoiceDate,
      due_date: invoiceToSave.dueDate,
      payment_terms: invoiceToSave.paymentTerms,
      subject: invoiceToSave.subject,
      project_name: invoiceToSave.projectName,
      project_location: invoiceToSave.projectLocation,
      subtotal: invoiceToSave.subtotal,
      discount: invoiceToSave.discount,
      taxable_amount: invoiceToSave.taxableAmount,
      vat_rate: invoiceToSave.vatRate,
      vat_amount: invoiceToSave.vatAmount,
      grand_total: invoiceToSave.grandTotal,
      amount_paid: invoiceToSave.amountPaid,
      outstanding_amount: invoiceToSave.outstandingAmount,
      notes: invoiceToSave.notes || null,
      terms_and_conditions: invoiceToSave.termsAndConditions,
      status: invoiceToSave.status,
      payment_status: invoiceToSave.paymentStatus,
      updated_at: new Date().toISOString(),
    });

    if (invErr) {
      throw new Error(invErr.message || "Failed to persist invoice header");
    }

    if (resolvedItems.length > 0) {
      await supabase.from("invoice_items").delete().eq("invoice_id", resolvedId);
      const { error: itemsErr } = await supabase.from("invoice_items").insert(
        resolvedItems.map((item, index) => ({
          id: item.id,
          invoice_id: resolvedId,
          sort_order: index,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          discount: item.discount,
          taxable_amount: item.taxableAmount,
          vat_amount: item.vatAmount,
          total: item.total,
        }))
      );
      if (itemsErr) {
        throw new Error(itemsErr.message || "Failed to persist invoice items");
      }
    }

    return invoiceToSave;
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) return true;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

