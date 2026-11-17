import { createClient } from "@/lib/supabase/client";
import { isValidUUID, generateUUID } from "@/lib/utils";
import type { Quotation } from "@/lib/data/quotations-mock";

export const QuotationsRepository = {
  async getAll(): Promise<Quotation[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          quotation_items (*)
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
        quotationNumber: row.quotation_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        clientPrintedName: row.client_printed_name || undefined,
        attention: row.attention || undefined,
        quotationDate: row.quotation_date,
        validUntil: row.valid_until,
        subject: row.subject,
        projectName: row.project_name,
        projectLocation: row.project_location,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        taxableAmount: Number(row.taxable_amount),
        vatRate: Number(row.vat_rate),
        vatAmount: Number(row.vat_amount),
        grandTotal: Number(row.grand_total),
        notes: row.notes || undefined,
        termsAndConditions: row.terms_and_conditions,
        status: row.status as Quotation["status"],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: (row.quotation_items || [])
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

  async getById(id: string): Promise<Quotation | null> {
    if (!id) return null;
    const list = await this.getAll();
    return list.find((q) => q.id === id) || null;
  },

  async save(quotation: Quotation): Promise<Quotation> {
    const supabase = createClient();
    const resolvedId = isValidUUID(quotation.id) ? quotation.id : generateUUID();
    const resolvedItems = (quotation.items || []).map((item) => ({
      ...item,
      id: isValidUUID(item.id) ? item.id : generateUUID(),
    }));

    const quotationToSave: Quotation = {
      ...quotation,
      id: resolvedId,
      items: resolvedItems,
    };

    const { error: quoteErr } = await supabase.from("quotations").upsert({
      id: resolvedId,
      quotation_number: quotationToSave.quotationNumber,
      customer_id: quotationToSave.customerId,
      customer_name: quotationToSave.customerName,
      client_printed_name: quotationToSave.clientPrintedName || null,
      attention: quotationToSave.attention || null,
      quotation_date: quotationToSave.quotationDate,
      valid_until: quotationToSave.validUntil,
      subject: quotationToSave.subject,
      project_name: quotationToSave.projectName,
      project_location: quotationToSave.projectLocation,
      subtotal: quotationToSave.subtotal,
      discount: quotationToSave.discount,
      taxable_amount: quotationToSave.taxableAmount,
      vat_rate: quotationToSave.vatRate,
      vat_amount: quotationToSave.vatAmount,
      grand_total: quotationToSave.grandTotal,
      notes: quotationToSave.notes || null,
      terms_and_conditions: quotationToSave.termsAndConditions,
      status: quotationToSave.status,
      updated_at: new Date().toISOString(),
    });

    if (quoteErr) {
      throw new Error(quoteErr.message || "Failed to persist quotation header");
    }

    if (resolvedItems.length > 0) {
      await supabase.from("quotation_items").delete().eq("quotation_id", resolvedId);
      const { error: itemsErr } = await supabase.from("quotation_items").insert(
        resolvedItems.map((item, index) => ({
          id: item.id,
          quotation_id: resolvedId,
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
        throw new Error(itemsErr.message || "Failed to persist quotation items");
      }
    }

    return quotationToSave;
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) return true;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

