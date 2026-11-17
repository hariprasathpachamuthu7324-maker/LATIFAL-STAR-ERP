"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AuditService } from "@/lib/audit/audit-service";
import type { AuditEvent, AuditAction, AuditEntityType } from "@/lib/audit/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  FileText,
  CreditCard,
  Settings,
  Users,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function AuditLogTab() {
  const [logs, setLogs] = React.useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("ALL");
  const [entityFilter, setEntityFilter] = React.useState<string>("ALL");

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    const data = await AuditService.getEvents({
      searchQuery,
      action: actionFilter as any,
      entityType: entityFilter as any,
    });
    setLogs(data);
    setIsLoading(false);
  }, [searchQuery, actionFilter, entityFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
        return <Badge variant="success" size="sm">CREATED</Badge>;
      case "UPDATE":
      case "UPDATE_SETTINGS":
        return <Badge variant="info" size="sm">UPDATED</Badge>;
      case "STATUS_CHANGE":
        return <Badge variant="warning" size="sm">STATUS CHANGED</Badge>;
      case "RECORD_PAYMENT":
        return <Badge variant="success" size="sm">PAYMENT RECORDED</Badge>;
      case "ASSIGN_ROLE":
        return <Badge variant="navy" size="sm">ROLE ASSIGNED</Badge>;
      case "DELETE":
        return <Badge variant="danger" size="sm">DELETED</Badge>;
      case "LOGIN":
        return <Badge variant="default" size="sm">LOGGED IN</Badge>;
      default:
        return <Badge variant="default" size="sm">{action}</Badge>;
    }
  };

  const getEntityIcon = (entityType: AuditEntityType) => {
    switch (entityType) {
      case "CUSTOMER":
      case "TEAM_MEMBER":
        return <Users className="w-3.5 h-3.5 text-[#0B1F33]" />;
      case "QUOTATION":
      case "INVOICE":
      case "PURCHASE_ORDER":
      case "WORK_COMPLETION":
        return <FileText className="w-3.5 h-3.5 text-[#2563EB]" />;
      case "SETTINGS":
        return <Settings className="w-3.5 h-3.5 text-slate-600" />;
      case "AUTH":
        return <Lock className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#0B1F33]" />
            System Audit Trail & Compliance Log
          </h3>
          <p className="text-xs text-slate-500">
            Immutable log of all user activities, security events, document lifecycle transitions, and UAE tax setting modifications.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          onClick={fetchLogs}
        >
          Refresh Log
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Search actor, email, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          options={[
            { value: "ALL", label: "All Actions" },
            { value: "CREATE", label: "Create Records" },
            { value: "UPDATE", label: "Update Records" },
            { value: "STATUS_CHANGE", label: "Status Changes" },
            { value: "RECORD_PAYMENT", label: "Payment Recordings" },
            { value: "ASSIGN_ROLE", label: "Role Assignments" },
            { value: "UPDATE_SETTINGS", label: "Settings Changes" },
            { value: "LOGIN", label: "Auth / Logins" },
          ]}
        />

        <Select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          options={[
            { value: "ALL", label: "All Entity Types" },
            { value: "CUSTOMER", label: "Customers" },
            { value: "QUOTATION", label: "Quotations" },
            { value: "INVOICE", label: "Tax Invoices" },
            { value: "PURCHASE_ORDER", label: "Purchase Orders" },
            { value: "WORK_COMPLETION", label: "Work Completion Reports" },
            { value: "TEAM_MEMBER", label: "Team Members" },
            { value: "SETTINGS", label: "Company Settings" },
            { value: "AUTH", label: "Authentication" },
          ]}
        />
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor / Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Event Details & Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length > 0 ? (
                logs.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(event.createdAt)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {event.actorName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {event.actorEmail} • {event.actorRole}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(event.action)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getEntityIcon(event.entityType)}
                        <div>
                          <span className="font-medium text-slate-800 block text-xs">
                            {event.entityName || event.entityId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {event.entityType} ({event.entityId})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {event.details ? (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-600 space-y-0.5">
                          {Object.entries(event.details).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <span className="font-semibold text-slate-500">{k}:</span>{" "}
                              <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
