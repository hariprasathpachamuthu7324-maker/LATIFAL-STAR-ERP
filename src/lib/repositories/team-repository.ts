import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/data/team-mock";

export const TeamRepository = {
  async getAll(): Promise<TeamMember[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone || undefined,
        role: row.role as TeamMember["role"],
        department: row.department || "Operations",
        jobTitle: row.job_title || "Staff",
        status: (row.is_active === false ? "INACTIVE" : "ACTIVE") as TeamMember["status"],
        avatarUrl: row.avatar_url || undefined,
        lastLoginAt: row.last_login_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<TeamMember | null> {
    const list = await this.getAll();
    return list.find((m) => m.id === id) || null;
  },

  async save(member: TeamMember): Promise<TeamMember> {
    try {
      const supabase = createClient();
      await supabase.from("profiles").upsert({
        id: member.id,
        full_name: member.fullName,
        email: member.email,
        phone: member.phone || null,
        role: member.role,
        department: member.department,
        job_title: member.jobTitle,
        is_active: member.status === "ACTIVE",
        avatar_url: member.avatarUrl || null,
        last_login_at: member.lastLoginAt || null,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Graceful fallback
    }
    return member;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      return !error;
    } catch {
      return true;
    }
  },
};
