import { createClient } from "@/lib/supabase/client";
import { DEFAULT_APP_SETTINGS, type AppSettings } from "@/lib/data/settings-mock";

export const SettingsRepository = {
  async getSettings(): Promise<AppSettings> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error || !data) {
        return DEFAULT_APP_SETTINGS;
      }

      return {
        company: {
          legalName: data.legal_name || DEFAULT_APP_SETTINGS.company.legalName,
          tradeLicenseNumber: data.trade_license_number || DEFAULT_APP_SETTINGS.company.tradeLicenseNumber,
          establishedYear: data.established_year || DEFAULT_APP_SETTINGS.company.establishedYear,
          address: data.address || DEFAULT_APP_SETTINGS.company.address,
          city: data.city || DEFAULT_APP_SETTINGS.company.city,
          country: data.country || DEFAULT_APP_SETTINGS.company.country,
          phone: data.phone || DEFAULT_APP_SETTINGS.company.phone,
          email: data.email || DEFAULT_APP_SETTINGS.company.email,
          website: data.website || DEFAULT_APP_SETTINGS.company.website,
        },
        tax: {
          trn: data.trn || DEFAULT_APP_SETTINGS.tax.trn,
          standardVatRate: data.standard_vat_rate !== null && data.standard_vat_rate !== undefined ? Number(data.standard_vat_rate) : DEFAULT_APP_SETTINGS.tax.standardVatRate,
          taxOfficeJurisdiction: data.tax_office_jurisdiction || DEFAULT_APP_SETTINGS.tax.taxOfficeJurisdiction,
          vatRegistrationDate: data.vat_registration_date || DEFAULT_APP_SETTINGS.tax.vatRegistrationDate,
        },
        banking: {
          bankName: data.bank_name || DEFAULT_APP_SETTINGS.banking.bankName,
          bankBranch: data.bank_branch || DEFAULT_APP_SETTINGS.banking.bankBranch,
          accountName: data.account_name || DEFAULT_APP_SETTINGS.banking.accountName,
          accountNumber: data.account_number || DEFAULT_APP_SETTINGS.banking.accountNumber,
          iban: data.iban || DEFAULT_APP_SETTINGS.banking.iban,
          swiftCode: data.swift_code || DEFAULT_APP_SETTINGS.banking.swiftCode,
        },
        documentDefaults: {
          quotationPrefix: data.quotation_prefix || DEFAULT_APP_SETTINGS.documentDefaults.quotationPrefix,
          invoicePrefix: data.invoice_prefix || DEFAULT_APP_SETTINGS.documentDefaults.invoicePrefix,
          purchaseOrderPrefix: data.purchase_order_prefix || DEFAULT_APP_SETTINGS.documentDefaults.purchaseOrderPrefix,
          workCompletionPrefix: data.work_completion_prefix || DEFAULT_APP_SETTINGS.documentDefaults.workCompletionPrefix,
          defaultPaymentTerms: data.default_payment_terms || DEFAULT_APP_SETTINGS.documentDefaults.defaultPaymentTerms,
          standardWarrantyClause: data.standard_warranty_clause || DEFAULT_APP_SETTINGS.documentDefaults.standardWarrantyClause,
          standardRemittanceClause: data.standard_remittance_clause || DEFAULT_APP_SETTINGS.documentDefaults.standardRemittanceClause,
        },
        preferences: {
          baseCurrency: data.base_currency || DEFAULT_APP_SETTINGS.preferences.baseCurrency,
          dateFormat: data.date_format || DEFAULT_APP_SETTINGS.preferences.dateFormat,
          autoCalculateVat: data.auto_calculate_vat !== undefined ? Boolean(data.auto_calculate_vat) : DEFAULT_APP_SETTINGS.preferences.autoCalculateVat,
          enableAuditLogging: data.enable_audit_logging !== undefined ? Boolean(data.enable_audit_logging) : DEFAULT_APP_SETTINGS.preferences.enableAuditLogging,
        },
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    try {
      const supabase = createClient();
      await supabase.from("company_settings").upsert({
        id: 1,
        legal_name: settings.company.legalName,
        trade_license_number: settings.company.tradeLicenseNumber,
        established_year: settings.company.establishedYear,
        address: settings.company.address,
        city: settings.company.city,
        country: settings.company.country,
        phone: settings.company.phone,
        email: settings.company.email,
        website: settings.company.website,
        trn: settings.tax.trn,
        standard_vat_rate: settings.tax.standardVatRate,
        tax_office_jurisdiction: settings.tax.taxOfficeJurisdiction,
        vat_registration_date: settings.tax.vatRegistrationDate || null,
        bank_name: settings.banking.bankName,
        bank_branch: settings.banking.bankBranch,
        account_name: settings.banking.accountName,
        account_number: settings.banking.accountNumber,
        iban: settings.banking.iban,
        swift_code: settings.banking.swiftCode,
        quotation_prefix: settings.documentDefaults.quotationPrefix,
        invoice_prefix: settings.documentDefaults.invoicePrefix,
        purchase_order_prefix: settings.documentDefaults.purchaseOrderPrefix,
        work_completion_prefix: settings.documentDefaults.workCompletionPrefix,
        default_payment_terms: settings.documentDefaults.defaultPaymentTerms,
        standard_warranty_clause: settings.documentDefaults.standardWarrantyClause,
        standard_remittance_clause: settings.documentDefaults.standardRemittanceClause,
        base_currency: settings.preferences.baseCurrency,
        date_format: settings.preferences.dateFormat,
        auto_calculate_vat: settings.preferences.autoCalculateVat,
        enable_audit_logging: settings.preferences.enableAuditLogging,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Graceful fallback
    }
    return settings;
  },
};
