import { createClient } from "@/lib/supabase/client";
import { isValidUUID, generateUUID } from "@/lib/utils";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";

export const WorkCompletionRepository = {
  async getAll(): Promise<WorkCompletionReport[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("work_completion_reports")
        .select(`
          *,
          work_completion_items (*),
          wcr_photos (*)
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
        reportNumber: row.report_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        clientPrintedName: row.client_printed_name || undefined,
        attention: row.attention || undefined,
        customerTrn: row.customer_trn || undefined,
        quotationId: row.quotation_id || undefined,
        quotationNumber: row.quotation_number || undefined,
        purchaseOrderId: row.purchase_order_id || undefined,
        purchaseOrderNumber: row.purchase_order_number || undefined,
        invoiceId: row.invoice_id || undefined,
        invoiceNumber: row.invoice_number || undefined,
        reportDate: row.report_date,
        workStartDate: row.work_start_date,
        workCompletionDate: row.work_completion_date,
        subject: row.subject,
        projectName: row.project_name,
        projectLocation: row.project_location,
        workDescription: row.work_description,
        completionPercentage: Number(row.completion_percentage),
        observations: row.observations || undefined,
        materialsUsed: row.materials_used || undefined,
        engineerInCharge: row.engineer_in_charge,
        clientRemarks: row.client_remarks || undefined,
        clientAcknowledgement: row.acknowledgement_status || row.client_acknowledgement_status
          ? {
              clientRepresentativeName: row.client_rep_name || row.client_representative_name || "",
              designation: row.client_rep_designation || row.client_representative_designation || "",
              contactPhone: row.client_rep_phone || row.client_representative_phone || undefined,
              acknowledgementDate: row.client_acknowledgement_date || row.work_completion_date || "",
              status: row.acknowledgement_status || row.client_acknowledgement_status,
            }
          : undefined,
        notes: row.notes || undefined,
        termsAndConditions: row.terms_and_conditions,
        status: row.status as WorkCompletionReport["status"],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: (row.work_completion_items || [])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity ? Number(item.quantity) : 1,
            unit: item.unit || "NOS",
            status: item.status,
            remarks: item.remarks || undefined,
          })),
        photos: (row.wcr_photos || []).map((p: any) => {
          let resolvedUrl = p.public_url;
          if (!resolvedUrl || !resolvedUrl.startsWith("http")) {
            if (p.storage_path && !p.storage_path.startsWith("data:")) {
              try {
                const { data } = supabase.storage.from("wcr-photos").getPublicUrl(p.storage_path);
                if (data?.publicUrl) {
                  resolvedUrl = data.publicUrl;
                }
              } catch {}
            }
          }
          if (resolvedUrl && (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://"))) {
            try {
              resolvedUrl = encodeURI(decodeURI(resolvedUrl));
            } catch {}
          }

          return {
            id: p.id,
            reportId: p.report_id,
            fileName: p.file_name,
            storagePath: p.storage_path,
            url: resolvedUrl || p.public_url || p.storage_path,
            dataUrl: p.data_url || undefined,
            category: p.storage_path?.includes('/after_') ? 'AFTER' : 'BEFORE',
            mimeType: p.mime_type,
            fileSize: Number(p.file_size),
            caption: p.caption || undefined,
            uploadedAt: p.uploaded_at,
            uploadedBy: p.uploaded_by || undefined,
          };
        }),
      }));
    } catch (err) {
      return [];
    }
  },

  async getById(id: string): Promise<WorkCompletionReport | null> {
    if (!id) return null;
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async save(report: WorkCompletionReport): Promise<WorkCompletionReport> {
    const supabase = createClient();
    const resolvedId = isValidUUID(report.id) ? report.id : generateUUID();
    const resolvedQuotationId = isValidUUID(report.quotationId) ? report.quotationId : null;
    const resolvedPurchaseOrderId = isValidUUID(report.purchaseOrderId) ? report.purchaseOrderId : null;
    const resolvedInvoiceId = isValidUUID(report.invoiceId) ? report.invoiceId : null;
    const resolvedItems = (report.items || []).map((item) => ({
      ...item,
      id: isValidUUID(item.id) ? item.id : generateUUID(),
    }));
    const resolvedPhotos = (report.photos || []).map((photo) => ({
      ...photo,
      id: isValidUUID(photo.id) ? photo.id : generateUUID(),
    }));

    const reportToSave: WorkCompletionReport = {
      ...report,
      id: resolvedId,
      quotationId: resolvedQuotationId || undefined,
      purchaseOrderId: resolvedPurchaseOrderId || undefined,
      invoiceId: resolvedInvoiceId || undefined,
      items: resolvedItems,
      photos: resolvedPhotos,
    };

    const { error: wcrErr } = await supabase.from("work_completion_reports").upsert({
      id: resolvedId,
      report_number: reportToSave.reportNumber,
      customer_id: reportToSave.customerId,
      customer_name: reportToSave.customerName,
      client_printed_name: reportToSave.clientPrintedName || null,
      attention: reportToSave.attention || null,
      customer_trn: reportToSave.customerTrn || null,
      quotation_id: resolvedQuotationId,
      quotation_number: reportToSave.quotationNumber || null,
      purchase_order_id: resolvedPurchaseOrderId,
      purchase_order_number: reportToSave.purchaseOrderNumber || null,
      invoice_id: resolvedInvoiceId,
      invoice_number: reportToSave.invoiceNumber || null,
      report_date: reportToSave.reportDate,
      work_start_date: reportToSave.workStartDate,
      work_completion_date: reportToSave.workCompletionDate,
      subject: reportToSave.subject,
      project_name: reportToSave.projectName,
      project_location: reportToSave.projectLocation,
      work_description: reportToSave.workDescription,
      completion_percentage: reportToSave.completionPercentage,
      observations: reportToSave.observations || null,
      materials_used: reportToSave.materialsUsed || null,
      engineer_in_charge: reportToSave.engineerInCharge,
      client_remarks: reportToSave.clientRemarks || null,
      client_rep_name: reportToSave.clientAcknowledgement?.clientRepresentativeName || null,
      client_rep_designation: reportToSave.clientAcknowledgement?.designation || null,
      client_rep_phone: reportToSave.clientAcknowledgement?.contactPhone || null,
      acknowledgement_status: reportToSave.clientAcknowledgement?.status || null,
      notes: reportToSave.notes || null,
      terms_and_conditions: reportToSave.termsAndConditions,
      status: reportToSave.status,
      updated_at: new Date().toISOString(),
    });

    if (wcrErr) {
      throw new Error(wcrErr.message || "Failed to persist work completion report header");
    }

    if (resolvedItems.length > 0) {
      await supabase.from("work_completion_items").delete().eq("report_id", resolvedId);
      const { error: itemsErr } = await supabase.from("work_completion_items").insert(
        resolvedItems.map((item, index) => ({
          id: item.id,
          report_id: resolvedId,
          sort_order: index,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          status: item.status,
          completion_percentage: 100,
          remarks: item.remarks || null,
        }))
      );
      if (itemsErr) {
        throw new Error(itemsErr.message || "Failed to persist work completion items");
      }
    }

    if (resolvedPhotos.length > 0) {
      await supabase.from("wcr_photos").delete().eq("report_id", resolvedId);
      const { error: photosErr } = await supabase.from("wcr_photos").insert(
        resolvedPhotos.map((photo) => ({
          id: photo.id,
          report_id: resolvedId,
          file_name: photo.fileName,
          storage_path: photo.storagePath,
          public_url: photo.url.startsWith("http") ? photo.url : null,
          mime_type: photo.mimeType,
          file_size: photo.fileSize,
          caption: photo.caption || null,
          uploaded_by: photo.uploadedBy || null,
          uploaded_at: photo.uploadedAt,
        }))
      );
      if (photosErr) {
        throw new Error(photosErr.message || "Failed to persist report photos");
      }
    }

    return reportToSave;
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) return true;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("work_completion_reports").delete().eq("id", id);
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

