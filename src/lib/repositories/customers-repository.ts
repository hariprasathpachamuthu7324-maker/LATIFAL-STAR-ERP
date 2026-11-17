import { createClient } from "@/lib/supabase/client";
import { isValidUUID, generateUUID } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers-mock";

export const CustomersRepository = {
  async getAll(): Promise<Customer[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        customerCode: row.customer_code,
        companyName: row.company_name,
        contactPerson: row.contact_person,
        email: row.email,
        phone: row.phone,
        alternatePhone: row.alternate_phone || undefined,
        customerType: row.customer_type as Customer["customerType"],
        address: row.address,
        city: row.city,
        country: row.country,
        taxRegistrationNumber: row.tax_registration_number || undefined,
        paymentTerms: row.payment_terms,
        status: row.status as Customer["status"],
        notes: row.notes || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      return [];
    }
  },

  async getById(id: string): Promise<Customer | null> {
    if (!id) return null;
    const list = await this.getAll();
    return list.find((c) => c.id === id) || null;
  },

  async save(customer: Customer): Promise<Customer> {
    const supabase = createClient();
    const resolvedId = isValidUUID(customer.id) ? customer.id : generateUUID();
    const customerToSave: Customer = {
      ...customer,
      id: resolvedId,
    };

    const { error } = await supabase.from("customers").upsert({
      id: resolvedId,
      customer_code: customerToSave.customerCode,
      company_name: customerToSave.companyName,
      contact_person: customerToSave.contactPerson,
      email: customerToSave.email,
      phone: customerToSave.phone,
      alternate_phone: customerToSave.alternatePhone || null,
      customer_type: customerToSave.customerType,
      address: customerToSave.address,
      city: customerToSave.city,
      country: customerToSave.country,
      tax_registration_number: customerToSave.taxRegistrationNumber || null,
      payment_terms: customerToSave.paymentTerms,
      status: customerToSave.status,
      notes: customerToSave.notes || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(error.message || "Failed to persist customer to database");
    }

    return customerToSave;
  },

  async delete(id: string): Promise<boolean> {
    if (!isValidUUID(id)) return true;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

