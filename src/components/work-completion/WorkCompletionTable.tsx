"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import type { WorkCompletionStatus } from "@/lib/work-completion/calculations";
import {
  Eye,
  Edit,
  Copy,
  RefreshCw,
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

export function WorkCompletionTable({
  reports,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}: {
  reports: WorkCompletionReport[];
  onView: (report: WorkCompletionReport) => void;
  onEdit: (report: WorkCompletionReport) => void;
  onChangeStatus: (report: WorkCompletionReport) => void;
  onDelete?: (report: WorkCompletionReport) => void;
}) {
  const getStatusBadge = (status: WorkCompletionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success" dot size="sm">Completed</Badge>;
      case "DRAFT":
        return <Badge variant="warning" dot size="sm">In Progress</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
    }
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-slate-600 mx-auto mb-3">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#002664]">No Work Reports Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No work completion reports match your search or filter criteria. Try adjusting your filters or create a new site execution report.
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
              <th className="py-3 px-4">Report Number</th>
              <th className="py-3 px-4">Customer & Site</th>
              <th className="py-3 px-4">Project Scope</th>
              <th className="py-3 px-4">Execution Dates</th>
              <th className="py-3 px-4 text-center">Completion</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {reports.map((report) => {
              const isCancelled = report.status === "CANCELLED";

              return (
                <tr
                  key={report.id}
                  className={`transition-colors group cursor-pointer ${
                    isCancelled
                      ? "bg-slate-50/40 text-slate-400 hover:bg-slate-50/80"
                      : "hover:bg-slate-50/70"
                  }`}
                  onClick={() => onView(report)}
                >
                  {/* Report Number */}
                  <td className="py-3.5 px-4 font-numeric font-bold whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`hover:underline ${
                          isCancelled
                            ? "line-through text-slate-400"
                            : "text-[#002664] font-semibold"
                        }`}
                      >
                        {report.reportNumber}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-normal mt-0.5">
                        {report.purchaseOrderNumber && (
                          <span>PO: {report.purchaseOrderNumber}</span>
                        )}
                        {report.quotationNumber && !report.purchaseOrderNumber && (
                          <span>Quote: {report.quotationNumber}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Customer / Site */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div
                      className={`font-semibold truncate ${
                        isCancelled ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {report.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {report.projectLocation}
                    </div>
                  </td>

                  {/* Subject & Project */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <div
                      className={`font-medium line-clamp-1 group-hover:text-[#002664] ${
                        isCancelled ? "text-slate-400" : "text-slate-800"
                      }`}
                      title={report.subject}
                    >
                      {report.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {report.projectName}
                    </div>
                  </td>

                  {/* Execution Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-700 font-numeric">
                      Done: {formatDate(report.workCompletionDate)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-numeric">
                      Started: {formatDate(report.workStartDate)}
                    </div>
                  </td>

                  {/* Completion % */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-xs font-numeric text-[#002664]">
                        {report.completionPercentage}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            report.completionPercentage === 100
                              ? "bg-emerald-500"
                              : report.completionPercentage >= 50
                              ? "bg-amber-500"
                              : "bg-[#2563EB]"
                          }`}
                          style={{ width: `${report.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(report.status)}
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
                        title="View Work Completion Certificate"
                        onClick={() => onView(report)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Edit Report"
                        onClick={() => onEdit(report)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#002664]"
                        title="Update Document Status"
                        onClick={() => onChangeStatus(report)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Report"
                        onClick={() => onDelete?.(report)}
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
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Showing <strong>{reports.length}</strong> site completion reports
        </span>
        <span className="font-numeric">
          Completed & Signed:{" "}
          <strong>{reports.filter((r) => r.status === "COMPLETED").length}</strong> / {reports.length}
        </span>
      </div>
    </div>
  );
}
