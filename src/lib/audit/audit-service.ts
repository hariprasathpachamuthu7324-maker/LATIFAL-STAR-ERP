import { createClient } from "@/lib/supabase/client";
import type { AuditEvent, AuditFilterParams } from "./types";

const inMemoryAuditLogs: AuditEvent[] = [];

export const AuditService = {
  /**
   * Logs a structured audit event
   */
  async logEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...event,
    };

    inMemoryAuditLogs.unshift(fullEvent);

    try {
      const supabase = createClient();
      await supabase.from("audit_logs").insert({
        id: fullEvent.id,
        actor_id: fullEvent.actorId,
        actor_name: fullEvent.actorName,
        actor_email: fullEvent.actorEmail,
        actor_role: fullEvent.actorRole,
        action: fullEvent.action,
        entity_type: fullEvent.entityType,
        entity_id: fullEvent.entityId,
        entity_name: fullEvent.entityName || null,
        details: fullEvent.details || null,
        ip_address: fullEvent.ipAddress || null,
        created_at: fullEvent.createdAt,
      });
    } catch {
      // Graceful fallback to in-memory audit trail
    }

    return fullEvent;
  },

  /**
   * Retrieves audit logs with filtering and search
   */
  async getEvents(filters?: AuditFilterParams): Promise<AuditEvent[]> {
    try {
      const supabase = createClient();
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.action && filters.action !== "ALL") {
        query = query.eq("action", filters.action);
      }
      if (filters?.entityType && filters.entityType !== "ALL") {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters?.actorRole && filters.actorRole !== "ALL") {
        query = query.eq("actor_role", filters.actorRole);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          actorId: row.actor_id,
          actorName: row.actor_name,
          actorEmail: row.actor_email,
          actorRole: row.actor_role,
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id,
          entityName: row.entity_name || undefined,
          details: row.details || undefined,
          ipAddress: row.ip_address || undefined,
          userAgent: row.user_agent || undefined,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // Fallback to in-memory
    }

    // Filter in-memory logs
    let result = [...inMemoryAuditLogs];

    if (filters?.action && filters.action !== "ALL") {
      result = result.filter((e) => e.action === filters.action);
    }
    if (filters?.entityType && filters.entityType !== "ALL") {
      result = result.filter((e) => e.entityType === filters.entityType);
    }
    if (filters?.actorRole && filters.actorRole !== "ALL") {
      result = result.filter((e) => e.actorRole === filters.actorRole);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.actorName.toLowerCase().includes(q) ||
          e.actorEmail.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.entityType.toLowerCase().includes(q) ||
          (e.entityName && e.entityName.toLowerCase().includes(q))
      );
    }

    return result;
  },
};
