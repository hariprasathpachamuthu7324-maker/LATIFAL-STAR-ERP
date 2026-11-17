"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/layout/Section";
import { toast } from "@/components/ui/Toast";
import { usePermissions } from "@/lib/auth/use-permissions";
import { AuditService } from "@/lib/audit/audit-service";
import { UserPlus, ShieldAlert, Lock } from "lucide-react";

import { TeamSummary } from "@/components/team/TeamSummary";
import {
  TeamToolbar,
  type TeamFilters,
} from "@/components/team/TeamToolbar";
import { TeamTable } from "@/components/team/TeamTable";
import { TeamMemberModal } from "@/components/team/TeamMemberModal";
import { RoleAssignmentModal } from "@/components/team/RoleAssignmentModal";

import {
  type TeamMember,
  type TeamRole,
} from "@/lib/data/team-mock";
import { TeamRepository } from "@/lib/repositories/team-repository";

const INITIAL_FILTERS: TeamFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  sortBy: "name",
};

export default function TeamPage() {
  const { user, can, isAdmin, isManager } = usePermissions();
  const canViewTeam = can("team:view");
  const canCreateMember = can("team:create");
  const canEditMember = can("team:edit");
  const canAssignRoles = can("team:assign_roles");
  const canDeleteMember = can("team:delete");

  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [filters, setFilters] = React.useState<TeamFilters>(INITIAL_FILTERS);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false);
  const [memberForRole, setMemberForRole] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    async function loadTeam() {
      try {
        const data = await TeamRepository.getAll();
        setMembers(data);
      } catch {
        setMembers([]);
      }
    }
    loadTeam();
  }, []);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<TeamFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.role !== "ALL" ||
    filters.status !== "ALL" ||
    filters.sortBy !== "name";

  // Filter & Sort Logic
  const filteredMembers = React.useMemo(() => {
    return members
      .filter((m) => {
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchName = m.fullName.toLowerCase().includes(q);
          const matchEmail = m.email.toLowerCase().includes(q);
          const matchDept = m.department.toLowerCase().includes(q);
          const matchTitle = m.jobTitle.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchDept && !matchTitle) {
            return false;
          }
        }

        if (filters.role !== "ALL" && m.role !== filters.role) {
          return false;
        }

        if (filters.status !== "ALL" && m.status !== filters.status) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "name":
            return a.fullName.localeCompare(b.fullName);
          case "department":
            return a.department.localeCompare(b.department);
          case "role":
            return a.role.localeCompare(b.role);
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [members, filters]);

  // Actions
  const handleOpenAdd = () => {
    if (!canCreateMember) {
      toast.error("Permission denied: You do not have access to add team members.");
      return;
    }
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    if (!canEditMember) {
      toast.error("Permission denied: You do not have access to edit team members.");
      return;
    }
    setEditingMember(m);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (saved: TeamMember) => {
    const isNew = !members.some((m) => m.id === saved.id);
    await TeamRepository.save(saved);

    setMembers((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? saved : m));
      }
      return [saved, ...prev];
    });

    await AuditService.logEvent({
      actorId: user?.id || "usr_unknown",
      actorName: user?.name || "System User",
      actorEmail: user?.email || "user@preedhar.local",
      actorRole: user?.role || "ADMIN",
      action: isNew ? "CREATE" : "UPDATE",
      entityType: "TEAM_MEMBER",
      entityId: saved.id,
      entityName: `${saved.fullName} (${saved.role})`,
      details: {
        role: saved.role,
        department: saved.department,
        jobTitle: saved.jobTitle,
      },
    });
  };

  const handleOpenRoleModal = (m: TeamMember) => {
    if (!canAssignRoles) {
      toast.error("Permission denied: Only Administrators can modify user roles.");
      return;
    }
    setMemberForRole(m);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (memberId: string, newRole: TeamRole) => {
    const target = members.find((m) => m.id === memberId);
    const oldRole = target?.role;

    if (target) {
      const updated = { ...target, role: newRole, updatedAt: new Date().toISOString() };
      await TeamRepository.save(updated);
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, role: newRole, updatedAt: new Date().toISOString() }
          : m
      )
    );

    await AuditService.logEvent({
      actorId: user?.id || "usr_unknown",
      actorName: user?.name || "System User",
      actorEmail: user?.email || "user@preedhar.local",
      actorRole: user?.role || "ADMIN",
      action: "ASSIGN_ROLE",
      entityType: "TEAM_MEMBER",
      entityId: memberId,
      entityName: target?.fullName || memberId,
      details: {
        previousRole: oldRole,
        newRole,
      },
    });

    toast.success("Role privileges updated and logged to audit trail");
  };

  const handleToggleStatus = async (m: TeamMember) => {
    if (!canEditMember) {
      toast.error("Permission denied: You cannot change account status.");
      return;
    }

    const newStatus: TeamMember["status"] = m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated: TeamMember = { ...m, status: newStatus, updatedAt: new Date().toISOString() };
    await TeamRepository.save(updated);

    setMembers((prev) =>
      prev.map((item) =>
        item.id === m.id
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );

    await AuditService.logEvent({
      actorId: user?.id || "usr_unknown",
      actorName: user?.name || "System User",
      actorEmail: user?.email || "user@preedhar.local",
      actorRole: user?.role || "ADMIN",
      action: "STATUS_CHANGE",
      entityType: "TEAM_MEMBER",
      entityId: m.id,
      entityName: m.fullName,
      details: { newStatus },
    });

    toast.info(
      newStatus === "ACTIVE"
        ? `Account for ${m.fullName} activated`
        : `Account for ${m.fullName} suspended`
    );
  };

  const handleDeleteMember = async (m: TeamMember) => {
    if (!canDeleteMember) {
      toast.error("Permission denied: Only Administrators can delete personnel records.");
      return;
    }

    await TeamRepository.delete(m.id);
    setMembers((prev) => prev.filter((item) => item.id !== m.id));

    await AuditService.logEvent({
      actorId: user?.id || "usr_unknown",
      actorName: user?.name || "System User",
      actorEmail: user?.email || "user@preedhar.local",
      actorRole: user?.role || "ADMIN",
      action: "DELETE",
      entityType: "TEAM_MEMBER",
      entityId: m.id,
      entityName: m.fullName,
    });

    toast.success(`Team member ${m.fullName} removed`);
  };

  const existingEmails = React.useMemo(() => members.map((m) => m.email), [members]);

  if (!canViewTeam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Team & Roles"
          description="Access Restricted"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Team & Roles", isCurrent: true },
          ]}
        />
        <Section variant="card">
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Access Restricted
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              You do not have the required permissions to view or manage team members. Please contact an administrator.
            </p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Team & Role Management"
        description="Manage organizational accounts, assign role privileges, track departmental engineers, and inspect system access status."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Team & Roles", isCurrent: true },
        ]}
        badge={
          isAdmin ? (
            <Badge variant="navy" size="sm">Admin Control</Badge>
          ) : isManager ? (
            <Badge variant="info" size="sm">Manager Access</Badge>
          ) : (
            <Badge variant="default" size="sm">Staff Directory</Badge>
          )
        }
        actions={
          canCreateMember ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenAdd}
            >
              Add Team Member
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-only Directory</span>
            </div>
          )
        }
      />

      {/* KPI Metrics Summary */}
      <TeamSummary members={members} />

      {/* Main Table Section */}
      <Section variant="card">
        <div className="space-y-4">
          <TeamToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <TeamTable
            members={filteredMembers}
            onEdit={handleOpenEdit}
            onAssignRole={handleOpenRoleModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteMember}
          />
        </div>
      </Section>

      {/* Add / Edit Member Modal */}
      {canCreateMember && (
        <TeamMemberModal
          open={isMemberModalOpen}
          onOpenChange={setIsMemberModalOpen}
          memberToEdit={editingMember}
          existingEmails={existingEmails}
          onSave={handleSaveMember}
        />
      )}

      {/* Role Assignment Modal */}
      {canAssignRoles && (
        <RoleAssignmentModal
          open={isRoleModalOpen}
          onOpenChange={setIsRoleModalOpen}
          member={memberForRole}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}
