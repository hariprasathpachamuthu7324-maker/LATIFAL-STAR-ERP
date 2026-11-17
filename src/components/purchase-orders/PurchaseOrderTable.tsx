"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatAED, formatDate } from "@/lib/utils";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import type { PurchaseOrderStatus } from "@/lib/purchase-orders/calculations";
import {
  Eye,
  Edit,
  Copy,
  RefreshCw,
  ClipboardList,
  Calendar,
  AlertCircle,
  Truck,
  Trash2,
} from "lucide-react";

export function PurchaseOrderTable({
  purchaseOrders,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}: {
  purchaseOrders: PurchaseOrder[];
  onView: (po: PurchaseOrder) => void;
  onEdit: (po: PurchaseOrder) => void;
  onChangeStatus: (po: PurchaseOrder) => void;
  onDelete?: (po: PurchaseOrder) => void;
}) {
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "ISSUED":
        return <Badge variant="navy" size="sm">Issued</Badge>;
      case "DRAFT":
        return <Badge variant="default" size="sm">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  if (purchaseOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mx-auto mb-3">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#002664]">No Purchase Orders Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No purchase orders match your search or filter criteria. Try adjusting your filters or create a new purchase order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">PO Number</th>
              <th className="py-3 px-4">Customer / Supplier</th>
              <th className="py-3 px-4">Procurement Scope</th>
              <th className="py-3 px-4">Schedule</th>
              <th className="py-3 px-4 text-right">Total Amount (AED)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {purchaseOrders.map((po) => {
              const isCancelled = po.status === "CANCELLED";

              return (
                <tr
                  key={po.id}
                  className={`transition-colors group cursor-pointer ${
                    isCancelled
                      ? "bg-slate-50/40 text-slate-400 hover:bg-slate-50/80"
                      : "hover:bg-slate-50/70"
                  }`}
                  onClick={() => onView(po)}
                >
                  {/* PO Number */}
                  <td className="py-3.5 px-4 font-numeric font-bold whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`hover:underline ${
                          isCancelled
                            ? "line-through text-slate-400"
                            : "text-[#002664] font-semibold"
                        }`}
                      >
                        {po.purchaseOrderNumber}
                      </span>
                      {po.quotationNumber && (
                        <span className="text-[10px] text-slate-600 font-normal flex items-center gap-1">
                          Quote: {po.quotationNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Customer / Supplier */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div
                      className={`font-semibold truncate ${
                        isCancelled ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {po.customerName}
                    </div>
                    {po.attention ? (
                      <div className="text-[11px] text-slate-500 truncate">
                        Attn: {po.attention}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 truncate">
                        {po.projectLocation}
                      </div>
                    )}
                  </td>

                  {/* Subject & Project */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <div
                      className={`font-medium line-clamp-1 group-hover:text-[#002664] ${
                        isCancelled ? "text-slate-400" : "text-slate-800"
                      }`}
                      title={po.subject}
                    >
                      {po.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {po.projectName}
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-700 font-numeric">
                      PO: {formatDate(po.poDate)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-numeric">
                      <Truck className="w-3 h-3 text-slate-400 inline" />
                      <span>Delivery: {formatDate(po.expectedDeliveryDate)}</span>
                    </div>
                  </td>

                  {/* Grand Total */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div
                      className={`font-bold font-numeric text-[13px] ${
                        isCancelled ? "text-slate-400" : "text-[#002664]"
                      }`}
                    >
                      {formatAED(po.grandTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-numeric">
                      Incl. 5% VAT
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(po.status)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="View Purchase Order"
                        onClick={() => onView(po)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Edit Purchase Order"
                        onClick={() => onEdit(po)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Update Document Status"
                        onClick={() => onChangeStatus(po)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Purchase Order"
                        onClick={() => onDelete?.(po)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>
          Showing <strong>{purchaseOrders.length}</strong> purchase orders
        </span>
        <div className="flex items-center gap-4 font-numeric">
          <span>
            Total Procurement Commitment:{" "}
            <strong className="text-[#002664]">
              {formatAED(
                purchaseOrders
                  .filter((p) => p.status !== "CANCELLED")
                  .reduce((acc, p) => acc + p.grandTotal, 0)
              )}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
