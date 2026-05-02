// src/domain/entities/collaboration.ts

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
}

export interface MembershipRequest {
  id: string;
  organization_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

// Enriched types for UI
export interface OrganizationWithRole extends Organization {
  role: 'admin' | 'member';
  member_count: number;
}

export interface ProjectWithMemberCount extends Project {
  member_count: number;
}
