"use client";

import * as React from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers-mock";
import { MoreVertical, Eye, Edit, UserCheck, UserX, Phone, Mail, Trash2 } from "lucide-react";

export function CustomerTable({
  customers,
  onViewCustomer,
  onEditCustomer,
  onToggleStatus,
  onDelete,
  onAddNew,
}: {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onAddNew: () => void;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(customers.length / pageSize) || 1;
  const paginatedData = customers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page to 1 if filtered list shrinks
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const columns: Column<Customer>[] = [
    {
      key: "customerCode",
      header: "Customer ID",
      sortable: true,
      render: (row) => (
        <span className="font-bold text-[#0B1F33]">{row.customerCode}</span>
      ),
    },
    {
      key: "companyName",
      header: "Company / Customer",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.companyName}</div>
          <div className="text-[11px] text-slate-400">{row.city}, {row.country}</div>
        </div>
      ),
    },
    {
      key: "contactPerson",
      header: "Contact Person",
      sortable: true,
      render: (row) => (
        <div className="font-medium text-slate-800">{row.contactPerson}</div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <span className="text-slate-600 font-numeric whitespace-nowrap">
          {row.phone}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-slate-500 truncate max-w-[180px] block">
          {row.email}
        </span>
      ),
    },
    {
      key: "customerType",
      header: "Type",
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
          {row.customerType}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      render: (row) => (
        <Badge
          variant={row.status === "ACTIVE" ? "success" : "default"}
          dot
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="text-slate-500 font-numeric">
          {formatDate(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            align="right"
            trigger={
              <IconButton variant="ghost" size="xs" aria-label="Customer actions">
                <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
              </IconButton>
            }
            items={[
              {
                label: "View Profile",
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => onViewCustomer(row),
              },
              {
                label: "Edit Information",
                icon: <Edit className="w-3.5 h-3.5" />,
                onClick: () => onEditCustomer(row),
              },
              { divider: true, label: "" },
              {
                label: row.status === "ACTIVE" ? "Deactivate Account" : "Reactivate Account",
                icon: row.status === "ACTIVE" ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
                onClick: () => onToggleStatus(row),
              },
              {
                label: "Delete Customer",
                icon: <Trash2 className="w-3.5 h-3.5 text-red-600" />,
                danger: true,
                onClick: () => onDelete?.(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={paginatedData}
      columns={columns}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => onViewCustomer(row)}
      emptyTitle="No Customers Found"
      emptyDescription="No customer records match your active search term or filter criteria."
      emptyActionLabel="+ Register First Customer"
      onEmptyAction={onAddNew}
      pagination={{
        currentPage,
        totalPages,
        totalItems: customers.length,
        pageSize,
        onPageChange: (p) => setCurrentPage(p),
      }}
    />
  );
}
