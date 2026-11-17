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
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Loader2,
} from "lucide-react";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, role, signOut, isLoading: isAuthLoading } = useAuth();
  const { isCollapsed, toggleCollapsed } = useShell();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navGroups = getFilteredNavigation(role);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-[#0B1F33] border-r border-[#1A385C] text-white transition-all duration-200 select-none",
        isCollapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Brand & Logo Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#1A385C] shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg py-1",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-slate-200/30">
            <Image
              src="/brand/latifal-star-logo.png"
              alt="LATIFAL STAR Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-[#3B82F6] leading-tight truncate">
                LATIFAL STAR
              </span>
              <span className="text-[10px] font-semibold text-[#E07614] tracking-wider uppercase truncate">
                TECHNICAL SERVICES
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle on Desktop */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="w-7 h-7 rounded-lg bg-[#112843] text-slate-300 hover:text-white hover:bg-[#1A385C] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-[#1A385C]/60">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="w-7 h-7 rounded-lg bg-[#112843] text-slate-300 hover:text-white hover:bg-[#1A385C] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map((group, groupIdx) => (
          <div key={group.group}>
            {/* Group label (expanded) or thin divider (collapsed, skip first) */}
            {!isCollapsed ? (
              <h4 className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {group.group}
              </h4>
            ) : (
              groupIdx > 0 && <div className="h-px bg-[#1A385C]/60 mx-3 my-2" />
            )}

            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                const navLink = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                      isActive
                        ? "bg-[#1A385C] text-white font-semibold shadow-xs"
                        : "text-slate-300 hover:text-white hover:bg-[#112843]/60",
                      isCollapsed && "justify-center px-0 py-2.5 w-full"
                    )}
                  >
                    {/* Active Left Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#E07614] rounded-r-full" />
                    )}

                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors",
                        isActive
                          ? "text-[#E07614]"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2563EB] text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip
                      key={item.href}
                      content={item.title}
                      position="right"
                    >
                      {navLink}
                    </Tooltip>
                  );
                }

                return navLink;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-[#1A385C] bg-[#070E18]/60 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#112843] border border-[#1A385C] flex items-center justify-center text-white shrink-0 text-xs font-bold">
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
                  {user?.email || "user@preedhar.local"}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoggingOut || isAuthLoading}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#112843]/50 hover:bg-rose-900/40 hover:text-rose-200 border border-transparent hover:border-rose-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Tooltip content={`${user?.name || "User"} (${role})`} position="right">
              <div className="w-8 h-8 rounded-full bg-[#112843] border border-[#1A385C] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            </Tooltip>
            <Tooltip content="Sign Out" position="right">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                aria-label="Sign out"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-[#112843] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

