export type CustomerType =
  | "Facilities Management"
  | "Construction Company"
  | "Property Management"
  | "Commercial Building"
  | "Hospitality & Hotel"
  | "Engineering Contractor"
  | "Residential Client";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  customerType: CustomerType;
  address: string;
  city: string;
  country: string;
  taxRegistrationNumber?: string;
  paymentTerms: number; // in days e.g. 30, 45, 60
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export const INITIAL_MOCK_CUSTOMERS: Customer[] = [];
