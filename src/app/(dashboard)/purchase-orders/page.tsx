"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

import { PurchaseOrderSummary } from "@/components/purchase-orders/PurchaseOrderSummary";
import {
  PurchaseOrderToolbar,
  type PurchaseOrderFilters,
} from "@/components/purchase-orders/PurchaseOrderToolbar";
import { PurchaseOrderTable } from "@/components/purchase-orders/PurchaseOrderTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PurchaseOrderFormModal } from "@/components/purchase-orders/PurchaseOrderFormModal";
import { PurchaseOrderDetailsModal } from "@/components/purchase-orders/PurchaseOrderDetailsModal";
import { PurchaseOrderStatusModal } from "@/components/purchase-orders/PurchaseOrderStatusModal";

import { type PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import { type Customer } from "@/lib/data/customers-mock";
import { type Quotation } from "@/lib/data/quotations-mock";
import { PurchaseOrdersRepository } from "@/lib/repositories/purchase-orders-repository";
import { CustomersRepository } from "@/lib/repositories/customers-repository";
import { QuotationsRepository } from "@/lib/repositories/quotations-repository";
import {
  calculateDeliveryDate,
  type PurchaseOrderStatus,
} from "@/lib/purchase-orders/calculations";

const INITIAL_FILTERS: PurchaseOrderFilters = {
  search: "",
  status: "ALL",
  customerId: "ALL",
  sortBy: "newest",
};

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [quotations, setQuotations] = React.useState<Quotation[]>([]);
  const [filters, setFilters] = React.useState<PurchaseOrderFilters>(INITIAL_FILTERS);

  // Modal State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPO, setEditingPO] = React.useState<PurchaseOrder | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedPO, setSelectedPO] = React.useState<PurchaseOrder | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [poForStatus, setPoForStatus] = React.useState<PurchaseOrder | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [poData, custData, quotData] = await Promise.all([
          PurchaseOrdersRepository.getAll(),
          CustomersRepository.getAll(),
          QuotationsRepository.getAll(),
        ]);
        setPurchaseOrders(poData);
        setCustomers(custData);
        setQuotations(quotData);
      } catch {
        setPurchaseOrders([]);
        setCustomers([]);
        setQuotations([]);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<PurchaseOrderFilters>) => {
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
  const filteredPurchaseOrders = React.useMemo(() => {
    return purchaseOrders
      .filter((po) => {
        // Search query
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const matchNumber = po.purchaseOrderNumber.toLowerCase().includes(query);
          const matchCustomer = po.customerName.toLowerCase().includes(query);
          const matchQuote = po.quotationNumber?.toLowerCase().includes(query);
          const matchSubject = po.subject.toLowerCase().includes(query);
          const matchProject = po.projectName.toLowerCase().includes(query);
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

        // Status Filter
        if (filters.status !== "ALL" && po.status !== filters.status) {
          return false;
        }

        // Customer Filter
        if (
          filters.customerId !== "ALL" &&
          po.customerId !== filters.customerId
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return new Date(b.poDate).getTime() - new Date(a.poDate).getTime();
          case "oldest":
            return new Date(a.poDate).getTime() - new Date(b.poDate).getTime();
          case "delivery_date":
            return (
              new Date(a.expectedDeliveryDate).getTime() -
              new Date(b.expectedDeliveryDate).getTime()
            );
          case "highest_amount":
            return b.grandTotal - a.grandTotal;
          case "lowest_amount":
            return a.grandTotal - b.grandTotal;
          case "po_number":
            return b.purchaseOrderNumber.localeCompare(a.purchaseOrderNumber);
          default:
            return 0;
        }
      });
  }, [purchaseOrders, filters]);

  // Create & Edit Actions
  const handleOpenCreate = async () => {
    setEditingPO(null);
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

  const handleOpenEdit = async (po: PurchaseOrder) => {
    setEditingPO(po);
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

  const handleSavePO = async (savedPO: PurchaseOrder) => {
    const persisted = await PurchaseOrdersRepository.save(savedPO);
    setPurchaseOrders((prev) => {
      const exists = prev.some((p) => p.id === persisted.id);
      if (exists) {
        return prev.map((p) => (p.id === persisted.id ? persisted : p));
      }
      return [persisted, ...prev];
    });

    if (selectedPO && selectedPO.id === persisted.id) {
      setSelectedPO(persisted);
    }
  };

  // View Details Action
  const handleViewDetails = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailsOpen(true);
  };

  // Change Status Action
  const [itemToDelete, setItemToDelete] = React.useState<PurchaseOrder | null>(null);

  const handleDeleteRequest = (po: PurchaseOrder) => {
    setItemToDelete(po);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await PurchaseOrdersRepository.delete(itemToDelete.id);
    setPurchaseOrders((prev) => prev.filter((p) => p.id !== itemToDelete.id));
    toast.success(`Purchase Order ${itemToDelete.poNumber} deleted`);
    setItemToDelete(null);
  };

  const handleOpenStatusModal = (po: PurchaseOrder) => {
    setPoForStatus(po);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (
    poId: string,
    newStatus: PurchaseOrderStatus
  ) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const updated = {
        ...po,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      await PurchaseOrdersRepository.save(updated);
    }

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
          : p
      )
    );

    if (selectedPO && selectedPO.id === poId) {
      setSelectedPO((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(`Purchase order status updated to ${newStatus}`);
  };

  const customersList = React.useMemo(() => {
    return customers.map((c) => ({ id: c.id, name: c.companyName }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Purchase Orders"
        description="Issue, approve, and track commercial purchase orders for technical services, equipment procurement, and subcontractors."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Orders", isCurrent: true },
        ]}
        badge={<Badge variant="navy" size="sm">LSTS-PO</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Create Purchase Order
          </Button>
        }
      />

      {/* KPI Stats Summary */}
      <PurchaseOrderSummary purchaseOrders={purchaseOrders} />

      {/* Filter and Search Toolbar */}
      <PurchaseOrderToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        customersList={customersList}
      />

      {/* Purchase Orders Data Table */}
      <PurchaseOrderTable
        purchaseOrders={filteredPurchaseOrders}
        onView={handleViewDetails}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenStatusModal}
        onDelete={handleDeleteRequest}
      />

      {/* Create / Edit Form Modal */}
      <PurchaseOrderFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        purchaseOrderToEdit={editingPO}
        customers={customers}
        quotations={quotations}
        onSave={handleSavePO}
      />

      {/* Purchase Order Printable Details View Modal */}
      <PurchaseOrderDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        purchaseOrder={selectedPO}
        onEdit={handleOpenEdit}
        onChangeStatus={handleOpenStatusModal}
      />

      {/* Quick Status Transition Modal */}
      <PurchaseOrderStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        purchaseOrder={poForStatus}
        onSave={handleStatusChange}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Purchase Order"
        description={`Are you sure you want to permanently delete PO ${itemToDelete?.poNumber}? This action cannot be undone.`}
        confirmLabel="Delete Document"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
