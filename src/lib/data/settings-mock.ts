export interface CompanyProfileSettings {
  legalName: string;
  tradeLicenseNumber: string;
  establishedYear: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
}

export interface TaxSettings {
  trn: string;
  standardVatRate: number; // 5.0
  taxOfficeJurisdiction: string;
  vatRegistrationDate: string;
}

export interface BankingSettings {
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
}

export interface DocumentDefaultsSettings {
  quotationPrefix: string;
  invoicePrefix: string;
  purchaseOrderPrefix: string;
  workCompletionPrefix: string;
  defaultPaymentTerms: string;
  standardWarrantyClause: string;
  standardRemittanceClause: string;
}

export interface SystemPreferencesSettings {
  baseCurrency: string;
  dateFormat: string;
  autoCalculateVat: boolean;
  enableAuditLogging: boolean;
}

export interface AppSettings {
  company: CompanyProfileSettings;
  tax: TaxSettings;
  banking: BankingSettings;
  documentDefaults: DocumentDefaultsSettings;
  preferences: SystemPreferencesSettings;
  updatedAt: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  company: {
    legalName: "LATIFAL STAR TECHNICAL SERVICES L.L.C",
    tradeLicenseNumber: "1251018",
    establishedYear: "2023",
    address: "Deira, Port Saeed, Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    phone: "+971561574740",
    email: "info@latifalstar.com",
    website: "https://latifalstar.com",
  },
  tax: {
    trn: "100234567800003",
    standardVatRate: 5.0,
    taxOfficeJurisdiction: "Federal Tax Authority (FTA) – Dubai, UAE",
    vatRegistrationDate: "2023-10-21",
  },
  banking: {
    bankName: "Emirates NBD",
    bankBranch: "Deira Branch, Dubai",
    accountName: "LATIFAL STAR TECHNICAL SERVICES L.L.C",
    accountNumber: "1012345678901",
    iban: "AE070260001012345678901",
    swiftCode: "EBILAEADXXX",
  },
  documentDefaults: {
    quotationPrefix: "LSTS-Q",
    invoicePrefix: "LSTS-INV",
    purchaseOrderPrefix: "LSTS-PO",
    workCompletionPrefix: "LSTS-WCR",
    defaultPaymentTerms: "30 Days",
    standardWarrantyClause: "12 months comprehensive warranty on replacement equipment and 6 months on workmanship.",
    standardRemittanceClause: "Please quote invoice reference on bank transfer advice and remit strictly within agreed credit terms.",
  },
  preferences: {
    baseCurrency: "AED",
    dateFormat: "YYYY-MM-DD",
    autoCalculateVat: true,
    enableAuditLogging: true,
  },
  updatedAt: "2026-11-17T09:00:00Z",
};
