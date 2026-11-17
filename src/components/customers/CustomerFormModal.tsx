"use client";

import * as React from "react";
import {
  EnterpriseWorkspace,
  WorkspaceHeader,
  WorkspaceMain,
  WorkspaceSection,
  WorkspaceSummaryPanel,
} from "@/components/workspace";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { generateUUID } from "@/lib/utils";
import { getNextDocNumber } from "@/lib/utils/doc-numbering";
import type { Customer, CustomerType, CustomerStatus } from "@/lib/data/customers-mock";
import { Building2, User, MapPin, Receipt, Save, ShieldCheck } from "lucide-react";

export function CustomerFormModal({
  open,
  onOpenChange,
  customerToEdit,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: Customer | null;
  onSave: (savedCustomer: Customer) => void;
}) {
  const isEditing = !!customerToEdit;

  const [formData, setFormData] = React.useState({
    companyName: "",
    customerType: "Engineering Contractor" as CustomerType,
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "Dubai",
    country: "UAE",
    taxRegistrationNumber: "",
    paymentTerms: 30,
    status: "ACTIVE" as CustomerStatus,
    notes: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (customerToEdit) {
      setFormData({
        companyName: customerToEdit.companyName || "",
        customerType: customerToEdit.customerType || "Engineering Contractor",
        contactPerson: customerToEdit.contactPerson || "",
        email: customerToEdit.email || "",
        phone: customerToEdit.phone || "",
        alternatePhone: customerToEdit.alternatePhone || "",
        address: customerToEdit.address || "",
        city: customerToEdit.city || "Dubai",
        country: customerToEdit.country || "UAE",
        taxRegistrationNumber: customerToEdit.taxRegistrationNumber || "",
        paymentTerms: customerToEdit.paymentTerms || 30,
        status: customerToEdit.status || "ACTIVE",
        notes: customerToEdit.notes || "",
      });
    } else {
      setFormData({
        companyName: "",
        customerType: "Engineering Contractor",
        contactPerson: "",
        email: "",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "Dubai",
        country: "UAE",
        taxRegistrationNumber: "",
        paymentTerms: 30,
        status: "ACTIVE",
        notes: "",
      });
    }
    setErrors({});
  }, [customerToEdit, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = "Company or customer name is required";
    }
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = "Contact person name is required";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Primary contact phone is required";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (formData.taxRegistrationNumber.trim() && formData.taxRegistrationNumber.length !== 15) {
      errs.taxRegistrationNumber = "UAE TRN must be exactly 15 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const customerCode = customerToEdit
          ? customerToEdit.customerCode
          : await getNextDocNumber("customer");
        const newCustomer: Customer = {
          id: customerToEdit ? customerToEdit.id : generateUUID(),
          customerCode,
        companyName: formData.companyName.trim(),
        customerType: formData.customerType,
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city,
        country: formData.country,
        taxRegistrationNumber: formData.taxRegistrationNumber.trim() || undefined,
        paymentTerms: Number(formData.paymentTerms) || 30,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        createdAt: customerToEdit ? customerToEdit.createdAt : now,
        updatedAt: now,
      };

      await onSave(newCustomer);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Customer ${newCustomer.companyName} updated successfully`
          : `New customer ${newCustomer.companyName} registered (${newCustomer.customerCode})`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to save customer to database");
    }
  };

  return (
    <EnterpriseWorkspace open={open} onClose={() => onOpenChange(false)}>
      <WorkspaceHeader
        title={isEditing ? "Edit Customer" : "Register New Customer"}
        subtitle="LATIFAL STAR TECHNICAL SERVICES â€¢ Client Database"
        documentNumber={customerToEdit?.customerCode}
        onClose={() => onOpenChange(false)}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-transparent"
          >
            {isEditing ? "Save Changes" : "Create Customer"}
          </Button>
        }
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceMain>
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
            <WorkspaceSection title="Company / Entity Information" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Company / Customer Name"
                    required
                    placeholder="e.g. Al Futtaim Engineering & Technologies"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={errors.companyName}
                  />
                </div>

                <Select
                  allowCustom
                  label="Customer Type"
                  required
                  value={formData.customerType}
                  onChange={(e) =>
                    setFormData({ ...formData, customerType: e.target.value as CustomerType })
                  }
                  options={[
                    { value: "Engineering Contractor", label: "Engineering Contractor" },
                    { value: "Facilities Management", label: "Facilities Management" },
                    { value: "Construction Company", label: "Construction Company" },
                    { value: "Property Management", label: "Property Management" },
                    { value: "Commercial Building", label: "Commercial Building" },
                    { value: "Hospitality & Hotel", label: "Hospitality & Hotel" },
                    { value: "Residential Client", label: "Residential Client" },
                  ]}
                />

                <Select allowCustom
                  label="Account Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as CustomerStatus })
                  }
                  options={[
                    { value: "ACTIVE", label: "Active (Operational)" },
                    { value: "INACTIVE", label: "Inactive (Dormant)" },
                  ]}
                />
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Contact Person & Communication" icon={User}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Contact Person"
                  required
                  placeholder="e.g. Eng. Tariq Mansoor"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  error={errors.contactPerson}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.ae"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />

                <Input
                  label="Primary Phone / Mobile"
                  required
                  placeholder="+971-4-213-7700"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                />

                <Input
                  label="Alternate Phone (Optional)"
                  placeholder="+971-50-982-3411"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                />
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Address & Location (UAE)" icon={MapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <Input
                    label="Street Address / Building"
                    placeholder="e.g. Al Futtaim Tower, Airport Road, Al Garhoud"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <Input
                  label="Emirate / City"
                  placeholder="e.g. Dubai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />

                <Input
                  label="Country"
                  disabled
                  value={formData.country}
                />

                <Input
                  label="Payment Credit Terms (Days)"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentTerms: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Tax Information & Internal Notes" icon={Receipt}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Tax Registration Number (UAE TRN)"
                    placeholder="100000000000003 (15 digits)"
                    helperText="Required for FTA-compliant commercial tax invoices"
                    value={formData.taxRegistrationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRegistrationNumber: e.target.value })
                    }
                    error={errors.taxRegistrationNumber}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label="Operational Notes & Specifications"
                    placeholder="Special client requirements, site access details, safety inductions..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </WorkspaceSection>
          </form>
        </WorkspaceMain>

        <WorkspaceSummaryPanel>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#002664] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Entity Context
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-4 text-sm">
              <div>
                <span className="block text-slate-500 mb-1">Status</span>
                <span className={`font-semibold ${formData.status === 'ACTIVE' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {formData.status}
                </span>
              </div>
              
              <div>
                <span className="block text-slate-500 mb-1">Credit Terms</span>
                <span className="font-semibold text-slate-800">
                  {formData.paymentTerms} Days
                </span>
              </div>
              
              <div>
                <span className="block text-slate-500 mb-1">TRN Status</span>
                {formData.taxRegistrationNumber.length === 15 ? (
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Valid Length
                  </span>
                ) : formData.taxRegistrationNumber.length > 0 ? (
                  <span className="font-semibold text-red-600">Invalid Length</span>
                ) : (
                  <span className="font-semibold text-amber-600">Not Provided</span>
                )}
              </div>
            </div>
            
            <div className="pt-2 text-xs text-slate-500 bg-slate-50/50 p-3 rounded-md border border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">Commercial Information</p>
              Clients with a valid 15-digit TRN are eligible for standardized UAE tax invoicing.
            </div>
          </div>
        </WorkspaceSummaryPanel>
      </div>
    </EnterpriseWorkspace>
  );
}
