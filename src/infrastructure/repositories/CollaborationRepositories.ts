import { supabase } from '../config/supabase';
import type {
  IOrganizationRepository,
  IProjectRepository,
  IMembershipRequestRepository,
  IOrganizationMemberRepository
} from '../../domain/repositories/interfaces';
import type {
  Organization,
  Project,
  OrganizationMember,
  MembershipRequest
} from '../../domain/entities/collaboration';

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  async create(name: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('create_organization_with_admin', { org_name: name });

    if (error) throw new Error(error.message);
    return data;
  }

  async getByUser(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!inner (
          user_id
        )
      `)
      .eq('organization_members.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllExceptUser(userId: string): Promise<Organization[]> {
    // Get user's organization IDs first
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId);

    const myOrgIds = (memberships || []).map(m => m.organization_id);

    // Get all public orgs excluding user's orgs
    let query = supabase
      .from('organizations')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (myOrgIds.length > 0) {
      query = query.not('id', 'in', `(${myOrgIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getMemberCount(orgId: string): Promise<number> {
    const { count, error } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (error) throw new Error(error.message);
    return count || 0;
  }
}

export class SupabaseProjectRepository implements IProjectRepository {
  async create(orgId: string, name: string): Promise<string> {
    const { data, error } = await supabase
      .from('projects')
      .insert({ organization_id: orgId, name })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  async getByOrg(orgId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getMemberCount(projectId: string): Promise<number> {
    const { count, error } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async assignMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userId });

    if (error) throw new Error(error.message);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}

export class SupabaseMembershipRequestRepository implements IMembershipRequestRepository {
  async submit(orgId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('membership_requests')
      .insert({ organization_id: orgId, user_id: userId });

    if (error) throw new Error(error.message);
  }

  async getPendingForOrg(orgId: string): Promise<MembershipRequest[]> {
    const { data, error } = await supabase
      .from('membership_requests')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getByUser(userId: string): Promise<MembershipRequest[]> {
    const { data, error } = await supabase
      .from('membership_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async approve(requestId: string): Promise<void> {
    const { data, error } = await supabase
      .from('membership_requests')
      .select('organization_id, user_id')
      .eq('id', requestId)
      .single();

    if (error) throw new Error(error.message);

    // Add as org member
    await supabase.from('organization_members').insert({
      organization_id: data.organization_id,
      user_id: data.user_id,
      role: 'member'
    });

    // Update request status
    await supabase
      .from('membership_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);
  }

  async reject(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('membership_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw new Error(error.message);
  }
}

export class SupabaseOrganizationMemberRepository implements IOrganizationMemberRepository {
  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId)
      .order('joined_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async addMember(orgId: string, userId: string, role: 'admin' | 'member'): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .insert({ organization_id: orgId, user_id: userId, role });

    if (error) throw new Error(error.message);
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async isAdmin(orgId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (error) return false;
    return data?.role === 'admin';
  }
}
