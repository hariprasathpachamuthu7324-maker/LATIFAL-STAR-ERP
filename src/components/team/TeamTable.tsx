"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { TeamMember, TeamRole, TeamMemberStatus } from "@/lib/data/team-mock";
import {
  Edit,
  Shield,
  UserCheck,
  UserX,
  UserCog,
  Trash2,
  Users,
} from "lucide-react";

export function TeamTable({
  members,
  onEdit,
  onAssignRole,
  onToggleStatus,
  onDelete,
}: {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onAssignRole: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}) {
  const getRoleBadge = (role: TeamRole) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="primary" size="sm">Administrator</Badge>;
      case "MANAGER":
        return <Badge variant="warning" size="sm">Manager</Badge>;
      case "STAFF":
        return <Badge variant="default" size="sm">Staff</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#0B1F33]">No Team Members Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No members match your search or filter criteria. Try adjusting your filters or invite a new team member.
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
              <th className="py-3 px-4">Team Member</th>
              <th className="py-3 px-4">Department & Title</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-center">Role</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {members.map((member) => {
              const isInactive = member.status === "INACTIVE";

              return (
                <tr
                  key={member.id}
                  className={`transition-colors group hover:bg-slate-50/70 ${
                    isInactive ? "opacity-60 bg-slate-50/30" : ""
                  }`}
                >
                  {/* Member Name + Avatar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {getInitials(member.fullName)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-[#0B1F33]">
                          {member.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Title */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">
                      {member.jobTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {member.department}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-numeric text-slate-600">
                    {member.phone || "—"}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {member.status === "ACTIVE" ? (
                      <Badge variant="success" dot size="sm">Active</Badge>
                    ) : (
                      <Badge variant="default" size="sm">Inactive</Badge>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-numeric text-slate-500">
                    {member.lastLoginAt ? formatDate(member.lastLoginAt) : "Never"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#0B1F33]"
                        title="Edit Details"
                        onClick={() => onEdit(member)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-[#2563EB]"
                        title="Assign Role"
                        onClick={() => onAssignRole(member)}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${
                          member.status === "ACTIVE"
                            ? "text-slate-400 hover:text-amber-600"
                            : "text-slate-400 hover:text-emerald-600"
                        }`}
                        title={
                          member.status === "ACTIVE"
                            ? "Deactivate Account"
                            : "Activate Account"
                        }
                        onClick={() => onToggleStatus(member)}
                      >
                        {member.status === "ACTIVE" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Member"
                        onClick={() => onDelete(member)}
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
          Showing <strong>{members.length}</strong> team personnel
        </span>
        <span>
          Active: <strong>{members.filter((m) => m.status === "ACTIVE").length}</strong>
        </span>
      </div>
    </div>
  );
}
