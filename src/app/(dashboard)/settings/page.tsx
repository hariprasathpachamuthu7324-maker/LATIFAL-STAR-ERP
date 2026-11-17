"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/lib/data/settings-mock";
import { SettingsRepository } from "@/lib/repositories/settings-repository";
import { CompanyProfileTab } from "@/components/settings/CompanyProfileTab";
import { TaxSettingsTab } from "@/components/settings/TaxSettingsTab";
import { BankingSettingsTab } from "@/components/settings/BankingSettingsTab";
import { DocumentDefaultsTab } from "@/components/settings/DocumentDefaultsTab";
import { SystemPreferencesTab } from "@/components/settings/SystemPreferencesTab";
import { AuditLogTab } from "@/components/settings/AuditLogTab";
import { usePermissions } from "@/lib/auth/use-permissions";
import { AuditService } from "@/lib/audit/audit-service";
import {
  Building2,
  Percent,
  Landmark,
  FileText,
  Sliders,
  ShieldAlert,
  Save,
  RotateCcw,
  Lock,
} from "lucide-react";

type SettingsTab =
  | "company"
  | "tax"
  | "banking"
  | "documents"
  | "preferences"
  | "audit";

export default function SettingsPage() {
  const { user, can } = usePermissions();
  const canEditSettings = can("settings:edit");
  const canViewAudit = can("audit:view");

  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("company");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const loaded = await SettingsRepository.getSettings();
        setSettings(loaded);
      } catch {
        setSettings(DEFAULT_APP_SETTINGS);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!canEditSettings) {
      toast.error("Permission denied: You need Administrator privileges to update company settings.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = {
        ...settings,
        updatedAt: new Date().toISOString(),
      };
      const saved = await SettingsRepository.saveSettings(updated);
      setSettings(saved);

      if (typeof window !== "undefined") {
        localStorage.setItem("preedhar_app_settings", JSON.stringify(saved));
      }

      // Log structured audit trail event
      await AuditService.logEvent({
        actorId: user?.id || "usr_unknown",
        actorName: user?.name || "System User",
        actorEmail: user?.email || "user@preedhar.local",
        actorRole: user?.role || "ADMIN",
        action: "UPDATE_SETTINGS",
        entityType: "SETTINGS",
        entityId: "1",
        entityName: "Company & Financial Configuration",
        details: {
          updatedAt: updated.updatedAt,
          trn: updated.tax.trn,
          vatRate: `${updated.tax.standardVatRate}%`,
        },
      });

      toast.success("Settings saved successfully and logged to audit trail");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!canEditSettings) {
      toast.error("Permission denied: Administrator privileges required.");
      return;
    }

    const saved = await SettingsRepository.saveSettings(DEFAULT_APP_SETTINGS);
    setSettings(saved);
    if (typeof window !== "undefined") {
      localStorage.setItem("preedhar_app_settings", JSON.stringify(DEFAULT_APP_SETTINGS));
    }
    toast.info("Settings reset to LATIFAL STAR corporate defaults");
  };

  const TABS = [
    { id: "company" as SettingsTab, label: "Company Profile", icon: Building2 },
    { id: "tax" as SettingsTab, label: "Tax & VAT", icon: Percent },
    { id: "banking" as SettingsTab, label: "Banking & IBAN", icon: Landmark },
    { id: "documents" as SettingsTab, label: "Document Defaults", icon: FileText },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: Sliders },
    ...(canViewAudit
      ? [{ id: "audit" as SettingsTab, label: "Audit & Security", icon: ShieldAlert }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application & Company Settings"
        description="Configure LATIFAL STAR legal identity, UAE TRN, default VAT rate (5.00%), banking IBAN details, sequence prefixes, and inspect security audit trail."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", isCurrent: true },
        ]}
        badge={
          canEditSettings ? (
            <Badge variant="navy" size="sm">Admin Access</Badge>
          ) : (
            <Badge variant="warning" size="sm" dot>Read Only Access</Badge>
          )
        }
        actions={
          canEditSettings && activeTab !== "audit" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                onClick={handleResetDefaults}
              >
                Reset Defaults
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          ) : !canEditSettings ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Editing locked by role policy</span>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 bg-white rounded-lg border border-slate-200/80 shadow-2xs p-2 space-y-1 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold tracking-tight transition-colors text-left ${
                  isActive
                    ? "bg-[#0B1F33] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#E65100]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="flex-1 w-full">
          {activeTab === "company" && (
            <CompanyProfileTab
              data={settings.company}
              onChange={(updated) => setSettings((prev) => ({ ...prev, company: updated }))}
            />
          )}

          {activeTab === "tax" && (
            <TaxSettingsTab
              data={settings.tax}
              onChange={(updated) => setSettings((prev) => ({ ...prev, tax: updated }))}
            />
          )}

          {activeTab === "banking" && (
            <BankingSettingsTab
              data={settings.banking}
              onChange={(updated) => setSettings((prev) => ({ ...prev, banking: updated }))}
            />
          )}

          {activeTab === "documents" && (
            <DocumentDefaultsTab
              data={settings.documentDefaults}
              onChange={(updated) => setSettings((prev) => ({ ...prev, documentDefaults: updated }))}
            />
          )}

          {activeTab === "preferences" && (
            <SystemPreferencesTab
              data={settings.preferences}
              onChange={(updated) => setSettings((prev) => ({ ...prev, preferences: updated }))}
            />
          )}

          {activeTab === "audit" && canViewAudit && <AuditLogTab />}
        </div>
      </div>
    </div>
  );
}
