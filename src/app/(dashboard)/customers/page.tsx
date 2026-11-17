"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { CustomerSummary } from "@/components/customers/CustomerSummary";
import { CustomerToolbar, type CustomerFilters } from "@/components/customers/CustomerToolbar";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";
import { type Customer } from "@/lib/data/customers-mock";
import { CustomersRepository } from "@/lib/repositories/customers-repository";
import { Plus } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters State
  const [filters, setFilters] = React.useState<CustomerFilters>({
    search: "",
    status: "ALL",
    type: "ALL",
    city: "ALL",
    sortBy: "name",
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [customerToEdit, setCustomerToEdit] = React.useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  React.useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await CustomersRepository.getAll();
        setCustomers(data);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const handleFiltersChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      type: "ALL",
      city: "ALL",
      sortBy: "name",
    });
  };

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "ALL" ||
    filters.type !== "ALL" ||
    filters.city !== "ALL" ||
    filters.sortBy !== "name";

  // Filter & Sort Logic
  const filteredCustomers = React.useMemo(() => {
    let result = [...customers];

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.customerCode.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status !== "ALL") {
      result = result.filter((c) => c.status === filters.status);
    }

    // Customer Type filter
    if (filters.type !== "ALL") {
      result = result.filter((c) => c.customerType === filters.type);
    }

    // City filter
    if (filters.city !== "ALL") {
      result = result.filter((c) => c.city === filters.city);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === "name") {
        return a.companyName.localeCompare(b.companyName);
      }
      if (filters.sortBy === "recent") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (filters.sortBy === "code") {
        return a.customerCode.localeCompare(b.customerCode);
      }
      return 0;
    });

    return result;
  }, [customers, filters]);

  // Actions
  const handleOpenCreateModal = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  const handleSaveCustomer = async (savedCustomer: Customer) => {
    const persisted = await CustomersRepository.save(savedCustomer);
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === persisted.id);
      if (exists) {
        return prev.map((c) => (c.id === persisted.id ? persisted : c));
      }
      return [persisted, ...prev];
    });

    if (selectedCustomer && selectedCustomer.id === persisted.id) {
      setSelectedCustomer(persisted);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const [itemToDelete, setItemToDelete] = React.useState<Customer | null>(null);

  const handleDeleteRequest = (customer: Customer) => {
    setItemToDelete(customer);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await CustomersRepository.delete(itemToDelete.id);
    setCustomers((prev) => prev.filter((c) => c.id !== itemToDelete.id));
    toast.success(`Customer ${itemToDelete.companyName} deleted`);
    setItemToDelete(null);
  };

  const handleToggleStatus = async (customer: Customer) => {
    const nextStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated: Customer = {
      ...customer,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    await handleSaveCustomer(updated);
    toast.info(
      `${customer.companyName} status changed to ${nextStatus === "ACTIVE" ? "Active" : "Inactive"}`
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Customer Management"
        description="Manage corporate client directory, technical contacts, UAE Tax Registration Numbers (TRN), and commercial billing terms."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customers", isCurrent: true },
        ]}
        badge={
          <Badge variant="navy" size="sm">
            {customers.length} Entities
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            New Customer
          </Button>
        }
      />

      {/* 2. KPI Summary Cards */}
      <CustomerSummary customers={customers} />

      {/* 3. Search & Filter Toolbar */}
      <CustomerToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Customer Data Table */}
      <CustomerTable
        customers={filteredCustomers}
        onViewCustomer={handleViewCustomer}
        onEditCustomer={handleEditCustomer}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteRequest}
        onAddNew={handleOpenCreateModal}
      />

      {/* 5. Create / Edit Customer Modal */}
      <CustomerFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customerToEdit={customerToEdit}
        onSave={handleSaveCustomer}
      />

      {/* 6. Customer Details Modal */}
      <CustomerDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Customer"
        description={`Are you sure you want to permanently delete ${itemToDelete?.companyName}? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
