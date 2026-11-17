"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { TeamMember, TeamRole } from "@/lib/data/team-mock";
import { Shield, ShieldCheck, UserCog, UserCheck } from "lucide-react";

export function RoleAssignmentModal({
  open,
  onOpenChange,
  member,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSave: (memberId: string, newRole: TeamRole) => void;
}) {
  const [selectedRole, setSelectedRole] = React.useState<TeamRole>("STAFF");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member, open]);

  if (!member) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSave(member.id, selectedRole);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 150);
  };

  const ROLE_OPTIONS = [
    {
      role: "ADMIN" as TeamRole,
      title: "Administrator",
      description:
        "Full unrestricted access across all commercial modules, financial settings, team administration, and system configurations.",
      icon: ShieldCheck,
      color: "bg-[#0B1F33] text-white",
    },
    {
      role: "MANAGER" as TeamRole,
      title: "Operations Manager",
      description:
        "Full management over commercial operations: create/approve Quotations, Invoices, Purchase Orders, and Work Completion Reports.",
      icon: UserCog,
      color: "bg-[#2563EB] text-white",
    },
    {
      role: "STAFF" as TeamRole,
      title: "Staff Member / Technician",
      description:
        "Standard field & operational access: view clients, create draft work reports, view authorized quotations and job sheets.",
      icon: UserCheck,
      color: "bg-slate-200 text-slate-700",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role & Privileges</DialogTitle>
          <DialogDescription>
            Update role permissions for{" "}
            <strong className="text-slate-800">{member.fullName}</strong> ({member.jobTitle})
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-2.5">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRole === opt.role;

            return (
              <button
                key={opt.role}
                type="button"
                onClick={() => setSelectedRole(opt.role)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]/30"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${opt.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0B1F33]">
                      {opt.title}
                    </span>
                    {member.role === opt.role && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            disabled={selectedRole === member.role}
          >
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
