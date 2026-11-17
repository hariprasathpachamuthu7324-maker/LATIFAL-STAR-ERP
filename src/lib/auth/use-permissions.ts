"use client";

import { useAuth } from "./auth-context";
import { hasPermission, type Permission } from "./permissions";

export function usePermissions() {
  const { user, role, isAdmin, isLoading } = useAuth();

  const isManager = role === "MANAGER";
  const isStaff = role === "STAFF";

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  return {
    user,
    role,
    isAdmin,
    isManager,
    isStaff,
    isLoading,
    can,
    hasPermission: (perm: Permission) => can(perm),
  };
}
