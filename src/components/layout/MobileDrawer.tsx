"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useShell } from "./ShellProvider";
import { getFilteredNavigation } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";
import { X, LogOut, User, Loader2 } from "lucide-react";

export function MobileDrawer() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const { isMobileDrawerOpen, setMobileDrawerOpen } = useShell();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navGroups = getFilteredNavigation(role);

  // Close drawer on route change
  React.useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname, setMobileDrawerOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen, setMobileDrawerOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    setMobileDrawerOpen(false);
  };

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <div className="relative flex flex-col w-72 max-w-[80vw] bg-[#001D4D] text-white h-full z-10 shadow-2xl border-r border-[#003080] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#003080] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <Image
                src="/brand/latifal-star-logo.png"
                alt="LATIFAL STAR Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                LATIFAL STAR
              </span>
              <span className="text-[9px] font-semibold text-[#60A5FA] tracking-wider uppercase">
                TECHNICAL SERVICES
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation menu"
            className="w-8 h-8 rounded-lg bg-[#002664] text-slate-300 hover:text-white flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.group}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                        isActive
                          ? "bg-[#003387] text-white font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-[#002664]/60"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#60A5FA] rounded-r-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-[#60A5FA]" : "text-slate-400"
                        )}
                      />

                      <span className="truncate flex-1">{item.title}</span>

                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0052CC] text-white font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Mobile User Profile Footer */}
        <div className="p-4 border-t border-[#003080] bg-[#001230] space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002664] border border-[#003080] flex items-center justify-center text-white shrink-0 text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "Staff Member"}
                </p>
                <Badge
                  variant={role === "ADMIN" ? "primary" : "navy"}
                  size="sm"
                  className="py-0 px-1 text-[10px]"
                >
                  {role}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "user@latifalstar.com"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#002664]/60 hover:bg-rose-900/40 hover:text-rose-200 border border-transparent hover:border-rose-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

