import * as React from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ShellProvider } from "@/components/layout/ShellProvider";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ShellProvider>
        <AppShell>{children}</AppShell>
      </ShellProvider>
    </AuthProvider>
  );
}
