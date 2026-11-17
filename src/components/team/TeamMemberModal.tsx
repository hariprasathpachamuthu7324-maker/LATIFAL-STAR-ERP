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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import type { TeamMember, TeamRole, TeamMemberStatus } from "@/lib/data/team-mock";
import { UserPlus, UserCheck } from "lucide-react";

export function TeamMemberModal({
  open,
  onOpenChange,
  memberToEdit,
  existingEmails,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberToEdit?: TeamMember | null;
  existingEmails: string[];
  onSave: (savedMember: TeamMember) => void;
}) {
  const isEditing = !!memberToEdit;

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    role: "STAFF" as TeamRole,
    department: "Operations",
    jobTitle: "",
    status: "ACTIVE" as TeamMemberStatus,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (memberToEdit) {
      setFormData({
        fullName: memberToEdit.fullName,
        email: memberToEdit.email,
        phone: memberToEdit.phone || "",
        role: memberToEdit.role,
        department: memberToEdit.department,
        jobTitle: memberToEdit.jobTitle,
        status: memberToEdit.status,
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "STAFF",
        department: "Operations & Service",
        jobTitle: "Operations Specialist",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [memberToEdit, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      errs.email = "Please provide a valid corporate email address";
    } else {
      const emailLower = formData.email.trim().toLowerCase();
      const duplicate = existingEmails.some(
        (e) =>
          e.toLowerCase() === emailLower &&
          (!memberToEdit || memberToEdit.email.toLowerCase() !== emailLower)
      );
      if (duplicate) {
        errs.email = "A team member with this email already exists";
      }
    }
    if (!formData.jobTitle.trim()) {
      errs.jobTitle = "Job title is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required member details");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const member: TeamMember = {
        id: memberToEdit ? memberToEdit.id : `team-${Date.now()}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        department: formData.department.trim() || "Operations",
        jobTitle: formData.jobTitle.trim(),
        status: formData.status,
        lastLoginAt: memberToEdit?.lastLoginAt,
        createdAt: memberToEdit ? memberToEdit.createdAt : now,
        updatedAt: now,
      };

      onSave(member);
      setIsSubmitting(false);
      onOpenChange(false);
      toast.success(
        isEditing
          ? `Team member ${member.fullName} updated`
          : `Team member ${member.fullName} added successfully`
      );
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            Configure user profile, organizational department, and access credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Eng. Rajesh Varma"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              error={errors.fullName}
            />
          </div>

          <div>
            <Input
              label="Corporate Email Address"
              type="email"
              required
              placeholder="e.g. rajesh.varma@preedhar.ae"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
            />
          </div>

          <div>
            <Input
              label="Contact Phone / Mobile"
              placeholder="e.g. +971-55-8912345"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                allowCustom
                allowCustom
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                options={[
                  { value: "Executive Management", label: "Executive Management" },
                  { value: "Engineering", label: "Engineering" },
                  { value: "Operations & Service", label: "Operations & Service" },
                  { value: "Electrical & Power", label: "Electrical & Power" },
                  { value: "HVAC & Fire Safety", label: "HVAC & Fire Safety" },
                  { value: "Finance & Accounts", label: "Finance & Accounts" },
                  { value: "Procurement & Logistics", label: "Procurement & Logistics" },
                ]}
              />
            </div>

            <div>
              <Input
                label="Job Title"
                required
                placeholder="e.g. Lead MEP Engineer"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                error={errors.jobTitle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="System Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as TeamRole,
                  })
                }
                options={[
                  { value: "STAFF", label: "Staff (Operations)" },
                  { value: "MANAGER", label: "Manager (Approvals)" },
                  { value: "ADMIN", label: "Administrator (Full Access)" },
                ]}
              />
            </div>

            <div>
              <Select allowCustom
                label="Account Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TeamMemberStatus,
                  })
                }
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive / Suspended" },
                ]}
              />
            </div>
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
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {isEditing ? "Save Changes" : "Create Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
