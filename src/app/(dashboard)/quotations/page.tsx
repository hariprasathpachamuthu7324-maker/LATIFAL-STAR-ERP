"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

import { QuotationSummary } from "@/components/quotations/QuotationSummary";
import {
  QuotationToolbar,
  type QuotationFilters,
} from "@/components/quotations/QuotationToolbar";
import { QuotationTable } from "@/components/quotations/QuotationTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuotationFormModal } from "@/components/quotations/QuotationFormModal";
import { QuotationDetailsModal } from "@/components/quotations/QuotationDetailsModal";
import { QuotationStatusModal } from "@/components/quotations/QuotationStatusModal";

import {
  type Quotation,
  type QuotationStatus,
} from "@/lib/data/quotations-mock";
import { type Customer } from "@/lib/data/customers-mock";
import { QuotationsRepository } from "@/lib/repositories/quotations-repository";
import { CustomersRepository } from "@/lib/repositories/customers-repository";

const INITIAL_FILTERS: QuotationFilters = {
  search: "",
  status: "ALL",
  customerId: "ALL",
  sortBy: "newest",
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filters, setFilters] = React.useState<QuotationFilters>(INITIAL_FILTERS);

  // Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingQuotation, setEditingQuotation] = React.useState<Quotation | null>(null);

    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const router = useRouter();

  const handleConvertToInvoice = (quote: Quotation) => {
    router.push(`/invoices?fromQuotation=${quote.id}`);
  };

  const handleConvertToWCR = (quote: Quotation) => {
    router.push(`/work-completion?fromQuotation=${quote.id}`);
  };
  const [selectedQuotation, setSelectedQuotation] = React.useState<Quotation | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [quotationForStatus, setQuotationForStatus] = React.useState<Quotation | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [qData, cData] = await Promise.all([
          QuotationsRepository.getAll(),
          CustomersRepository.getAll(),
        ]);
        setQuotations(qData);
        setCustomers(cData);
      } catch {
        setQuotations([]);
        setCustomers([]);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<QuotationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "ALL" ||
    filters.customerId !== "ALL" ||
    filters.sortBy !== "newest";

  // Filter & Sort Logic
  const filteredQuotations = React.useMemo(() => {
    return quotations
      .filter((q) => {
        // Search query
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchNumber = q.quotationNumber.toLowerCase().includes(query);
          const matchCustomer = q.customerName.toLowerCase().includes(query);
          const matchSubject = q.subject.toLowerCase().includes(query);
          const matchProject = q.projectName.toLowerCase().includes(query);
          const matchLocation = q.projectLocation.toLowerCase().includes(query);
          if (!matchNumber && !matchCustomer && !matchSubject && !matchProject && !matchLocation) {
            return false;
          }
        }

        // Status Filter
        if (filters.status !== "ALL" && q.status !== filters.status) {
          return false;
        }

        // Customer Filter
        if (filters.customerId !== "ALL" && q.customerId !== filters.customerId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return new Date(b.quotationDate).getTime() - new Date(a.quotationDate).getTime();
          case "oldest":
            return new Date(a.quotationDate).getTime() - new Date(b.quotationDate).getTime();
          case "highest_value":
            return b.grandTotal - a.grandTotal;
          case "lowest_value":
            return a.grandTotal - b.grandTotal;
          case "doc_number":
            return b.quotationNumber.localeCompare(a.quotationNumber);
          default:
            return 0;
        }
      });
  }, [quotations, filters]);

  // Create & Edit Actions
  const handleOpenCreate = async () => {
    setEditingQuotation(null);
    try {
      const cData = await CustomersRepository.getAll();
      setCustomers(cData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (quote: Quotation) => {
    setEditingQuotation(quote);
    try {
      const cData = await CustomersRepository.getAll();
      setCustomers(cData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleSaveQuotation = async (savedQuote: Quotation) => {
    const persisted = await QuotationsRepository.save(savedQuote);
    setQuotations((prev) => {
      const exists = prev.some((q) => q.id === persisted.id);
      if (exists) {
        return prev.map((q) => (q.id === persisted.id ? persisted : q));
      }
      return [persisted, ...prev];
    });

    if (selectedQuotation && selectedQuotation.id === persisted.id) {
      setSelectedQuotation(persisted);
    }
  };

  // View Details Action
  const handleViewDetails = (quote: Quotation) => {
    setSelectedQuotation(quote);
    setIsDetailsOpen(true);
  };

  // Change Status Action
  const handleOpenStatusModal = (quote: Quotation) => {
    setQuotationForStatus(quote);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (quotationId: string, newStatus: QuotationStatus) => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (quote) {
      const updated = { ...quote, status: newStatus, updatedAt: new Date().toISOString() };
      await QuotationsRepository.save(updated);
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? { ...q, status: newStatus, updatedAt: new Date().toISOString() }
          : q
      )
    );

    if (selectedQuotation && selectedQuotation.id === quotationId) {
      setSelectedQuotation((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(`Quotation status updated to ${newStatus}`);
  };

  const [itemToDelete, setItemToDelete] = React.useState<Quotation | null>(null);

  // Delete Action
  const handleDeleteRequest = (quote: Quotation) => {
    setItemToDelete(quote);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await QuotationsRepository.delete(itemToDelete.id);
    setQuotations((prev) => prev.filter((q) => q.id !== itemToDelete.id));
    toast.success(`Quotation ${itemToDelete.quotationNumber} deleted`);
    setItemToDelete(null);
  };

  const customersList = React.useMemo(() => {
    return customers.map((c) => ({ id: c.id, name: c.companyName }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quotations"
        description="Build, price, and manage technical service quotations with itemized rate schedules and UAE 5% VAT calculations."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Quotations", isCurrent: true },
        ]}
        badge={<Badge variant="primary" size="sm">LSTS-Q</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Create Quotation
          </Button>
        }
      />

      {/* KPI Stats Summary */}
      <QuotationSummary quotations={quotations} />

      {/* Filter and Search Toolbar */}
      <QuotationToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        customersList={customersList}
      />

      {/* Quotations Data Table */}
      <QuotationTable
        quotations={filteredQuotations}
        onView={handleViewDetails}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenStatusModal}
        onDelete={handleDeleteRequest}
      />

      {/* Create / Edit Form Modal */}
      <QuotationFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        quotationToEdit={editingQuotation}
        customers={customers}
        onSave={handleSaveQuotation}
      />

      {/* Quotation Printable Details View Modal */}
      <QuotationDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        quotation={selectedQuotation}
        onEdit={handleOpenEdit}
                onChangeStatus={handleOpenStatusModal}
        onConvertToInvoice={handleConvertToInvoice}
        onConvertToWCR={handleConvertToWCR}/>

      {/* Quick Status Transition Modal */}
      <QuotationStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        quotation={quotationForStatus}
        onStatusChange={handleStatusChange}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Quotation"
        description={`Are you sure you want to permanently delete Quotation ${itemToDelete?.quotationNumber}? This action cannot be undone.`}
        confirmLabel="Delete Document"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

