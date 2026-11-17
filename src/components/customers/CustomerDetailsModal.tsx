"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers-mock";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Clock,
  Edit,
  ShieldCheck,
} from "lucide-react";

export function CustomerDetailsModal({
  open,
  onOpenChange,
  customer,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
}) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle>{customer.companyName}</DialogTitle>
              <DialogDescription className="mt-0.5">
                Customer Reference Code: <strong className="text-[#002664]">{customer.customerCode}</strong>
              </DialogDescription>
            </div>
            <Badge
              variant={customer.status === "ACTIVE" ? "success" : "default"}
              dot
              size="md"
            >
              {customer.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3 text-xs">
          {/* Key Attribute Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Type</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {customer.customerType}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {customer.city}, {customer.country}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Terms</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {customer.paymentTerms === 0 ? "Immediate / COD" : `Net ${customer.paymentTerms} Days`}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">UAE TRN</span>
              <span className="font-semibold text-[#0F172A] font-numeric mt-0.5 block truncate">
                {customer.taxRegistrationNumber || "Not Registered"}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-lg border border-slate-200/80 bg-white space-y-2">
            <h4 className="text-xs font-bold text-[#002664] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Person:</span>
                <span className="font-bold text-slate-800">{customer.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address:</span>
                <a
                  href={`mailto:${customer.email}`}
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  {customer.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Phone:</span>
                <a
                  href={`tel:${customer.phone}`}
                  className="font-medium text-slate-800 hover:text-[#2563EB]"
                >
                  {customer.phone}
                </a>
              </div>
              {customer.alternatePhone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Alternate Phone:</span>
                  <span className="font-medium text-slate-700">{customer.alternatePhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address & Facility */}
          <div className="p-4 rounded-lg border border-slate-200/80 bg-white space-y-2">
            <h4 className="text-xs font-bold text-[#002664] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              Billing & Site Address
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              {customer.address || "No street address specified"}
              {customer.address ? `, ${customer.city}, ${customer.country}` : ""}
            </p>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-amber-900 space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Operational Notes</span>
              <p className="text-xs leading-relaxed">{customer.notes}</p>
            </div>
          )}

          {/* Metadata Audit Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Created on: {formatDate(customer.createdAt)}</span>
            <span>Last updated: {formatDateTime(customer.updatedAt)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => {
              onEdit(customer);
            }}
          >
            Edit Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

