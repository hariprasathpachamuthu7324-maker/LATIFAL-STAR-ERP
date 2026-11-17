"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import {
  InvoiceToolbar,
  type InvoiceFilters,
} from "@/components/invoices/InvoiceToolbar";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InvoiceFormModal } from "@/components/invoices/InvoiceFormModal";
import { InvoiceDetailsModal } from "@/components/invoices/InvoiceDetailsModal";
import { InvoiceStatusModal } from "@/components/invoices/InvoiceStatusModal";

import { type Invoice } from "@/lib/data/invoices-mock";
import { type Customer } from "@/lib/data/customers-mock";
import { type Quotation } from "@/lib/data/quotations-mock";
import { InvoicesRepository } from "@/lib/repositories/invoices-repository";
import { CustomersRepository } from "@/lib/repositories/customers-repository";
import { QuotationsRepository } from "@/lib/repositories/quotations-repository";
import {
  calculateDueDate,
  type InvoiceDocumentStatus,
  type InvoicePaymentStatus,
} from "@/lib/invoices/calculations";

const INITIAL_FILTERS: InvoiceFilters = {
  search: "",
  documentStatus: "ALL",
  paymentStatus: "ALL",
  customerId: "ALL",
  sortBy: "newest",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [filters, setFilters] = React.useState<InvoiceFilters>(INITIAL_FILTERS);

  // Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);
  const [initialData, setInitialData] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromQuoteId = params.get("fromQuotation");
      if (fromQuoteId) {
        window.history.replaceState(null, "", "/invoices");
        Promise.all([
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
        ]).then(([custData, quotData]) => {
          setCustomers(custData);
          setQuotations(quotData);
          const quote = quotData.find(q => q.id === fromQuoteId);
          if (quote) {
            setInitialData({
              customerId: quote.customerId,
              customerName: quote.customerName,
              clientPrintedName: quote.clientPrintedName || quote.customerName,
              attention: quote.attention,
              customerTrn: quote.customerTrn,
              quotationId: quote.id,
              quotationNumber: quote.quotationNumber,
              subject: quote.subject,
              projectName: quote.projectName,
              projectLocation: quote.projectLocation,
              items: quote.items.map(item => ({ ...item, id: crypto.randomUUID() }))
            });
            setEditingInvoice(null);
            setIsFormOpen(true);
          }
        });
      }
    }
  }, []);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [invoiceForStatus, setInvoiceForStatus] = React.useState<Invoice | null>(null);
  const [statusModalMode, setStatusModalMode] = React.useState<
    "document_status" | "payment"
  >("document_status");

  React.useEffect(() => {
    async function loadData() {
      try {
        const [invData, custData, quotData] = await Promise.all([
          InvoicesRepository.getAll(),
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
        ]);
        setInvoices(invData);
        setCustomers(custData);
        setQuotations(quotData);
      } catch {
        setInvoices([]);
        setCustomers([]);
        setQuotations([]);
      }
    }
    loadData();
  }, []);

  // Filters Handler
  const handleFiltersChange = (newFilters: Partial<InvoiceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.documentStatus !== "ALL" ||
    filters.paymentStatus !== "ALL" ||
    filters.customerId !== "ALL" ||
    filters.sortBy !== "newest";

  // Filter & Sort Logic
  const filteredInvoices = React.useMemo(() => {
    return invoices
      .filter((inv) => {
        // Search query
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchNumber = inv.invoiceNumber.toLowerCase().includes(query);
          const matchCustomer = inv.customerName.toLowerCase().includes(query);
          const matchQuote = inv.quotationNumber?.toLowerCase().includes(query);
          const matchSubject = inv.subject.toLowerCase().includes(query);
          const matchProject = inv.projectName.toLowerCase().includes(query);
          if (
            !matchNumber &&
            !matchCustomer &&
            !matchQuote &&
            !matchSubject &&
            !matchProject
          ) {
            return false;
          }
        }

        // Document Status Filter
        if (
          filters.documentStatus !== "ALL" &&
          inv.status !== filters.documentStatus
        ) {
          return false;
        }

        // Payment Status Filter
        if (
          filters.paymentStatus !== "ALL" &&
          inv.paymentStatus !== filters.paymentStatus
        ) {
          return false;
        }

        // Customer Filter
        if (
          filters.customerId !== "ALL" &&
          inv.customerId !== filters.customerId
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return (
              new Date(b.invoiceDate).getTime() -
              new Date(a.invoiceDate).getTime()
            );
          case "oldest":
            return (
              new Date(a.invoiceDate).getTime() -
              new Date(b.invoiceDate).getTime()
            );
          case "due_date":
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          case "highest_amount":
            return b.grandTotal - a.grandTotal;
          case "lowest_amount":
            return a.grandTotal - b.grandTotal;
          case "invoice_number":
            return b.invoiceNumber.localeCompare(a.invoiceNumber);
          default:
            return 0;
        }
      });
  }, [invoices, filters]);

  // Create & Edit Actions
  const handleOpenCreate = async () => {
    setEditingInvoice(null);
    try {
      const [custData, quotData] = await Promise.all([
        CustomersRepository.getAll(),
        QuotationsRepository.getAll(),
      ]);
      setCustomers(custData);
      setQuotations(quotData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (inv: Invoice) => {
    setEditingInvoice(inv);
    try {
      const [custData, quotData] = await Promise.all([
        CustomersRepository.getAll(),
        QuotationsRepository.getAll(),
      ]);
      setCustomers(custData);
      setQuotations(quotData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleSaveInvoice = async (savedInv: Invoice) => {
    const persisted = await InvoicesRepository.save(savedInv);
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === persisted.id);
      if (exists) {
        return prev.map((i) => (i.id === persisted.id ? persisted : i));
      }
      return [persisted, ...prev];
    });

    if (selectedInvoice && selectedInvoice.id === persisted.id) {
      setSelectedInvoice(persisted);
    }
  };

  // View Details Action
  const handleViewDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  // Status & Payment Modal Actions
  const handleOpenDocStatusModal = (inv: Invoice) => {
    setInvoiceForStatus(inv);
    setStatusModalMode("document_status");
    setIsStatusModalOpen(true);
  };

  const [itemToDelete, setItemToDelete] = React.useState<Invoice | null>(null);

  const handleDeleteRequest = (inv: Invoice) => {
    setItemToDelete(inv);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await InvoicesRepository.delete(itemToDelete.id);
    setInvoices((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    toast.success(`Invoice ${itemToDelete.invoiceNumber} deleted`);
    setItemToDelete(null);
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setInvoiceForStatus(inv);
    setStatusModalMode("payment");
    setIsStatusModalOpen(true);
  };

  const handleStatusOrPaymentSave = async (
    invoiceId: string,
    updates: {
      status?: InvoiceDocumentStatus;
      paymentStatus?: InvoicePaymentStatus;
      amountPaid?: number;
      outstandingAmount?: number;
    }
  ) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      const updated = {
        ...inv,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await InvoicesRepository.save(updated);
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : inv
      )
    );

    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev) => (prev ? { ...prev, ...updates } : null));
    }

    toast.success("Invoice updated successfully");
  };

  const customersList = React.useMemo(() => {
    return customers.map((c) => ({ id: c.id, name: c.companyName }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tax Invoices (UAE VAT)"
        description="Manage tax invoices, payment status, and outstanding balances."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices", isCurrent: true },
        ]}
        badge={<Badge variant="navy" size="sm">LSTS-INV</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            New Invoice
          </Button>
        }
      />

      {/* KPI Financial Summary */}
      <InvoiceSummary invoices={invoices} />

      {/* Search and Filters Toolbar */}
      <InvoiceToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        customersList={customersList}
      />

      {/* Invoices Data Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        onView={handleViewDetails}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenDocStatusModal}
        onUpdatePayment={handleOpenPaymentModal}
        onDelete={handleDeleteRequest}
      />

      {/* Create / Edit Form Modal */}
      <InvoiceFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        invoiceToEdit={editingInvoice}
        initialData={initialData}
        customers={customers}
        quotations={quotations}
        onSave={handleSaveInvoice}
      />

      {/* Invoice Printable Details View Modal */}
      <InvoiceDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        invoice={selectedInvoice}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenDocStatusModal}
        onUpdatePayment={handleOpenPaymentModal}
        onDelete={handleDeleteRequest}
      />

      {/* Status & Payment Transition Modal */}
      <InvoiceStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        invoice={invoiceForStatus}
        mode={statusModalMode}
        onSave={handleStatusOrPaymentSave}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Invoice"
        description={`Are you sure you want to permanently delete Invoice ${itemToDelete?.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Delete Document"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

