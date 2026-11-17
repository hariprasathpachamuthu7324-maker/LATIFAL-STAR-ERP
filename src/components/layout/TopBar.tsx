"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useShell } from "./ShellProvider";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronRight,
  Loader2,
} from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const { toggleMobileDrawer } = useShell();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Generate dynamic breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);
  const pageTitle =
    segments.length > 0
      ? segments[0]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Dashboard";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left Area: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileDrawer}
          aria-label="Open navigation menu"
          className="lg:hidden w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#64748B]">
          <Link
            href="/dashboard"
            className="hover:text-[#0F172A] transition-colors font-medium text-[#475569] hidden sm:inline"
          >
            LSTS ERP
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1.5 hidden sm:inline" />
          <span className="font-bold text-[#0F172A] text-sm">
            {pageTitle}
          </span>
        </nav>
      </div>

      {/* Right Area: Notification + User Menu */}
      <div className="flex items-center gap-3">
        {/* Notification Dropdown */}
        <Dropdown
          align="right"
          width="w-72"
          trigger={
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0052CC] rounded-full border-2 border-white" />
            </button>
          }
          items={[
            {
              id: "notif_header",
              label: (
                <div className="py-1">
                  <p className="text-xs font-bold text-[#0F172A]">Notifications</p>
                  <p className="text-[10px] text-slate-500">You have 3 unread messages</p>
                </div>
              ),
              disabled: true,
            },
            { id: "divider-n1", label: "", disabled: true },
            {
              id: "n1",
              label: (
                <div className="flex flex-col gap-0.5 whitespace-normal">
                  <span className="text-xs font-semibold text-slate-800">Payment Received</span>
                  <span className="text-[11px] text-slate-500">AED 45,000 received for Invoice LSTS-INV-2026-437</span>
                  <span className="text-[10px] text-[#0052CC] font-medium mt-1">10 mins ago</span>
                </div>
              ),
              onClick: () => { window.location.href = "/invoices" },
            },
            {
              id: "n2",
              label: (
                <div className="flex flex-col gap-0.5 whitespace-normal">
                  <span className="text-xs font-semibold text-slate-800">Quotation Approved</span>
                  <span className="text-[11px] text-slate-500">Client accepted Quotation LSTS-Q2026-118</span>
                  <span className="text-[10px] text-[#0052CC] font-medium mt-1">1 hour ago</span>
                </div>
              ),
              onClick: () => { window.location.href = "/quotations" },
            },
            {
              id: "n3",
              label: (
                <div className="flex flex-col gap-0.5 whitespace-normal">
                  <span className="text-xs font-semibold text-slate-800">Material Delivery</span>
                  <span className="text-[11px] text-slate-500">PO-2026-049 materials delivered to site</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">2 hours ago</span>
                </div>
              ),
              onClick: () => { window.location.href = "/purchase-orders" },
            },
            { id: "divider-n2", label: "", disabled: true },
            {
              id: "mark-read",
              label: "Mark all as read",
              onClick: () => {},
            }
          ]}
        />

        <div className="h-5 w-px bg-[#E2E8F0]" />

        {/* User Account Menu Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#002664] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-[#0F172A] hidden md:inline truncate max-w-[140px]">
                {user?.name || "Staff Member"}
              </span>
            </button>
          }
          items={[
            {
              id: "profile_header",
              label: (
                <div className="py-1">
                  <p className="text-xs font-bold text-[#0F172A] truncate">
                    {user?.name || "Staff Member"}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {user?.email || "user@latifalstar.com"}
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {role}
                  </span>
                </div>
              ),
              disabled: true,
            },
            { id: "divider-1", label: "", disabled: true },
            {
              id: "settings",
              label: "Company Settings",
              icon: <Settings className="w-3.5 h-3.5 text-[#64748B]" />,
              onClick: () => {
                window.location.href = "/settings";
              },
            },
            {
              id: "logout",
              label: isLoggingOut ? "Signing out..." : "Sign Out",
              icon: isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
              ),
              variant: "destructive",
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
