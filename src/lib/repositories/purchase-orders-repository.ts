import { createClient } from "@/lib/supabase/client";
import { isValidUUID, generateUUID } from "@/lib/utils";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";

export const PurchaseOrdersRepository = {
  async getAll(): Promise<PurchaseOrder[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          purchase_order_items (*)
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
        purchaseOrderNumber: row.purchase_order_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        clientPrintedName: row.client_printed_name || undefined,
        attention: row.attention || undefined,
        customerTrn: row.customer_trn || undefined,
        quotationId: row.quotation_id || undefined,
        quotationNumber: row.quotation_number || undefined,
        invoiceId: row.invoice_id || undefined,
        invoiceNumber: row.invoice_number || undefined,
        poDate: row.po_date,
        expectedDeliveryDate: row.expected_delivery_date,
        subject: row.subject,
        projectName: row.project_name,
        projectLocation: row.project_location,
        deliveryAddress: row.delivery_address || undefined,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        taxableAmount: Number(row.taxable_amount),
        vatRate: Number(row.vat_rate),
        vatAmount: Number(row.vat_amount),
        grandTotal: Number(row.grand_total),
        notes: row.notes || undefined,
        termsAndConditions: row.terms_and_conditions,
        status: row.status as PurchaseOrder["status"],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: (row.purchase_order_items || [])
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

  async getById(id: string): Promise<PurchaseOrder | null> {
    if (!id) return null;
    const list = await this.getAll();
    return list.find((po) => po.id === id) || null;
  },

  async save(po: PurchaseOrder): Promise<PurchaseOrder> {
    const supabase = createClient();
    const resolvedId = isValidUUID(po.id) ? po.id : generateUUID();
    const resolvedQuotationId = isValidUUID(po.quotationId) ? po.quotationId : null;
    const resolvedInvoiceId = isValidUUID(po.invoiceId) ? po.invoiceId : null;
    const resolvedItems = (po.items || []).map((item) => ({
      ...item,
      id: isValidUUID(item.id) ? item.id : generateUUID(),
    }));

    const poToSave: PurchaseOrder = {
      ...po,
      id: resolvedId,
      quotationId: resolvedQuotationId || undefined,
      invoiceId: resolvedInvoiceId || undefined,
      items: resolvedItems,
    };

    const { error: poErr } = await supabase.from("purchase_orders").upsert({
      id: resolvedId,
      purchase_order_number: poToSave.purchaseOrderNumber,
      customer_id: poToSave.customerId,
      customer_name: poToSave.customerName,
      client_printed_name: poToSave.clientPrintedName || null,
      attention: poToSave.attention || null,
      customer_trn: poToSave.customerTrn || null,
      quotation_id: resolvedQuotationId,
      quotation_number: poToSave.quotationNumber || null,
      invoice_id: resolvedInvoiceId,
      invoice_number: poToSave.invoiceNumber || null,
      po_date: poToSave.poDate,
      expected_delivery_date: poToSave.expectedDeliveryDate,
      subject: poToSave.subject,
      project_name: poToSave.projectName,
      project_location: poToSave.projectLocation,
      delivery_address: poToSave.deliveryAddress || null,
      subtotal: poToSave.subtotal,
      discount: poToSave.discount,
      taxable_amount: poToSave.taxableAmount,
      vat_rate: poToSave.vatRate,
      vat_amount: poToSave.vatAmount,
      grand_total: poToSave.grandTotal,
      notes: poToSave.notes || null,
      terms_and_conditions: poToSave.termsAndConditions,
      status: poToSave.status,
      updated_at: new Date().toISOString(),
    });

    if (poErr) {
      throw new Error(poErr.message || "Failed to persist purchase order header");
    }

    if (resolvedItems.length > 0) {
      await supabase.from("purchase_order_items").delete().eq("purchase_order_id", resolvedId);
      const { error: itemsErr } = await supabase.from("purchase_order_items").insert(
        resolvedItems.map((item, index) => ({
          id: item.id,
          purchase_order_id: resolvedId,
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
        throw new Error(itemsErr.message || "Failed to persist purchase order items");
      }
    }

    return poToSave;
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) return true;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

