"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

import { WorkCompletionSummary } from "@/components/work-completion/WorkCompletionSummary";
import {
  WorkCompletionToolbar,
  type WorkCompletionFilters,
} from "@/components/work-completion/WorkCompletionToolbar";
import { WorkCompletionTable } from "@/components/work-completion/WorkCompletionTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { WorkCompletionFormModal } from "@/components/work-completion/WorkCompletionFormModal";
import { WorkCompletionDetailsModal } from "@/components/work-completion/WorkCompletionDetailsModal";
import { WorkCompletionStatusModal } from "@/components/work-completion/WorkCompletionStatusModal";

import { type WorkCompletionReport } from "@/lib/data/work-completion-mock";
import { type Customer } from "@/lib/data/customers-mock";
import { type Quotation } from "@/lib/data/quotations-mock";
import { type PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import { WorkCompletionRepository } from "@/lib/repositories/work-completion-repository";
import { CustomersRepository } from "@/lib/repositories/customers-repository";
import { QuotationsRepository } from "@/lib/repositories/quotations-repository";
import { PurchaseOrdersRepository } from "@/lib/repositories/purchase-orders-repository";
import type { WorkCompletionStatus } from "@/lib/work-completion/calculations";

const INITIAL_FILTERS: WorkCompletionFilters = {
  search: "",
  status: "ALL",
  customerId: "ALL",
  sortBy: "newest",
};

export default function WorkCompletionPage() {
  const [reports, setReports] = React.useState<WorkCompletionReport[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [filters, setFilters] = React.useState<WorkCompletionFilters>(INITIAL_FILTERS);

  // Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReport, setEditingReport] =
    React.useState<WorkCompletionReport | null>(null);
  const [initialData, setInitialData] = React.useState<any>(null);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] =
    React.useState<WorkCompletionReport | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [reportForStatus, setReportForStatus] =
    React.useState<WorkCompletionReport | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [wcrData, custData, quotData, poData] = await Promise.all([
          WorkCompletionRepository.getAll(),
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
          PurchaseOrdersRepository.getAll(),
        ]);
        setReports(wcrData);
        setCustomers(custData);
        setQuotations(quotData);
        setPurchaseOrders(poData);
      } catch {
        setReports([]);
        setCustomers([]);
        setQuotations([]);
        setPurchaseOrders([]);
      }
    }
    loadData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromQuoteId = params.get("fromQuotation");
      if (fromQuoteId) {
        window.history.replaceState(null, "", "/work-completion");
        Promise.all([
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
          PurchaseOrdersRepository.getAll(),
        ]).then(([custData, quotData, poData]) => {
          setCustomers(custData);
          setQuotations(quotData);
          setPurchaseOrders(poData);
          const quote = quotData.find((q) => q.id === fromQuoteId);
          if (quote) {
            setInitialData({
              customerId: quote.customerId,
              customerName: quote.customerName,
              quotationId: quote.id,
              quotationNumber: quote.quotationNumber,
              projectName: quote.projectName,
              projectLocation: quote.projectLocation,
              subject: quote.subject,
            });
            setEditingReport(null);
            setIsFormOpen(true);
          }
        });
      }
    }
  }, []);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<WorkCompletionFilters>) => {
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
  const filteredReports = React.useMemo(() => {
    return reports
      .filter((r) => {
        // Search query
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchNumber = (r.reportNumber || "").toLowerCase().includes(query);
          const matchCustomer = (r.customerName || "").toLowerCase().includes(query);
          const matchQuote = (r.quotationNumber || "").toLowerCase().includes(query);
          const matchPO = (r.purchaseOrderNumber || "").toLowerCase().includes(query);
          const matchSubject = (r.subject || "").toLowerCase().includes(query);
          const matchProject = (r.projectName || "").toLowerCase().includes(query);
          const matchEngineer = (r.engineerInCharge || "").toLowerCase().includes(query);
          if (
            !matchNumber &&
            !matchCustomer &&
            !matchQuote &&
            !matchPO &&
            !matchSubject &&
            !matchProject &&
            !matchEngineer
          ) {
            return false;
          }
        }

        // Status Filter
        if (filters.status !== "ALL" && r.status !== filters.status) {
          return false;
        }

        // Customer Filter
        if (
          filters.customerId !== "ALL" &&
          r.customerId !== filters.customerId
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return (
              new Date(b.reportDate).getTime() -
              new Date(a.reportDate).getTime()
            );
          case "oldest":
            return (
              new Date(a.reportDate).getTime() -
              new Date(b.reportDate).getTime()
            );
          case "completion_rate":
            return b.completionPercentage - a.completionPercentage;
          case "report_number":
            return b.reportNumber.localeCompare(a.reportNumber);
          default:
            return 0;
        }
      });
  }, [reports, filters]);

  // Create & Edit Actions
  const handleOpenCreate = async () => {
    setEditingReport(null);
    try {
      const [custData, quotData, poData] = await Promise.all([
        CustomersRepository.getAll(),
        QuotationsRepository.getAll(),
        PurchaseOrdersRepository.getAll(),
      ]);
      setCustomers(custData);
      setQuotations(quotData);
      setPurchaseOrders(poData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (report: WorkCompletionReport) => {
    setEditingReport(report);
    try {
      const [custData, quotData, poData] = await Promise.all([
        CustomersRepository.getAll(),
        QuotationsRepository.getAll(),
        PurchaseOrdersRepository.getAll(),
      ]);
      setCustomers(custData);
      setQuotations(quotData);
      setPurchaseOrders(poData);
    } catch {
      // safe fallback
    }
    setIsFormOpen(true);
  };

  const handleSaveReport = async (savedReport: WorkCompletionReport) => {
    const persisted = await WorkCompletionRepository.save(savedReport);
    setReports((prev) => {
      const exists = prev.some((r) => r.id === persisted.id);
      if (exists) {
        return prev.map((r) => (r.id === persisted.id ? persisted : r));
      }
      return [persisted, ...prev];
    });

    if (selectedReport && selectedReport.id === persisted.id) {
      setSelectedReport(persisted);
    }
  };

  // View Details Action
  const handleViewDetails = (report: WorkCompletionReport) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  // Change Status Action
  const [itemToDelete, setItemToDelete] = React.useState<WorkCompletionReport | null>(null);

  const handleDeleteRequest = (report: WorkCompletionReport) => {
    setItemToDelete(report);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await WorkCompletionRepository.delete(itemToDelete.id);
    setReports((prev) => prev.filter((r) => r.id !== itemToDelete.id));
    toast.success(`Report ${itemToDelete.reportNumber} deleted`);
    setItemToDelete(null);
  };

  const handleOpenStatusModal = (report: WorkCompletionReport) => {
    setReportForStatus(report);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (
    reportId: string,
    newStatus: WorkCompletionStatus
  ) => {
    const r = reports.find((rep) => rep.id === reportId);
    if (r) {
      const updated = {
        ...r,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      await WorkCompletionRepository.save(updated);
    }

    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId
          ? { ...rep, status: newStatus, updatedAt: new Date().toISOString() }
          : rep
      )
    );

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }

    toast.success(`Work Completion Report status updated to ${newStatus}`);
  };

  const customersList = React.useMemo(() => {
    return customers.map((c) => ({ id: c.id, name: c.companyName }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Work Completion Reports (WCR)"
        description="Site handover sign-offs, technical observations, photographic evidence, and client acceptance records."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Work Completion", isCurrent: true },
        ]}
        badge={<Badge variant="navy" size="sm">LSTS-WCR</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Create Report
          </Button>
        }
      />

      {/* KPI Stats Summary */}
      <WorkCompletionSummary reports={reports} />

      {/* Filter and Search Toolbar */}
      <WorkCompletionToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        customersList={customersList}
      />

      {/* Reports Data Table */}
      <WorkCompletionTable
        reports={filteredReports}
        onView={handleViewDetails}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenStatusModal}
        onDelete={handleDeleteRequest}
      />

      {/* Create / Edit Form Modal */}
      <WorkCompletionFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        reportToEdit={editingReport}
        initialData={initialData}
        customers={customers}
        quotations={quotations}
        purchaseOrders={purchaseOrders}
        onSave={handleSaveReport}
      />

      {/* Printable / Detail Workspace View Modal */}
      <WorkCompletionDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        report={selectedReport}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenStatusModal}
      />

      {/* Quick Status Transition Modal */}
      <WorkCompletionStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        report={reportForStatus}
        onSave={handleStatusChange}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Work Completion Report"
        description={`Are you sure you want to permanently delete Report ${itemToDelete?.reportNumber}? This action cannot be undone.`}
        confirmLabel="Delete Document"
        onConfirm={confirmDelete}
      />
    </div>
  );
}


