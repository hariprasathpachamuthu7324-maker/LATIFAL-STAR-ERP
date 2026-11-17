"use client";

import * as React from "react";

interface ShellContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;
}

const ShellContext = React.createContext<ShellContextType | undefined>(undefined);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState<boolean>(false);

  // Restore collapsed state from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("preedhar_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("preedhar_sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen((prev) => !prev);
  };

  // Set CSS custom property on document root for smooth width calculations
  React.useEffect(() => {
    const width = isCollapsed ? "72px" : "260px";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [isCollapsed]);

  return (
    <ShellContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobileDrawerOpen,
        setMobileDrawerOpen: setIsMobileDrawerOpen,
        toggleMobileDrawer,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const context = React.useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}
