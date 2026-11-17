export type TeamRole = "ADMIN" | "MANAGER" | "STAFF";
export type TeamMemberStatus = "ACTIVE" | "INACTIVE";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  department: string;
  jobTitle: string;
  status: TeamMemberStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MOCK_TEAM: TeamMember[] = [];
