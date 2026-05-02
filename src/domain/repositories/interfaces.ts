import type { DashboardMetrics, FullTestPlan, Task, Participant, Observation, Finding } from "../entities/types";
import type { Organization, Project, OrganizationMember, MembershipRequest } from "../entities/collaboration";

export interface ITestPlanRepository {
  getAllMetrics(): Promise<DashboardMetrics[]>;
  getFullPlan(id: string): Promise<FullTestPlan>;
  create(data: Omit<FullTestPlan, 'id' | 'tasks' | 'participants' | 'observations' | 'findings'>): Promise<string>;
  update(id: string, data: Partial<Omit<FullTestPlan, 'id' | 'tasks' | 'participants' | 'observations' | 'findings'>>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ITaskRepository {
  saveAll(tasks: Partial<Task>[]): Promise<void>;
  getByPlanId(planId: string): Promise<Task[]>;
}

export interface IParticipantRepository {
  saveAll(participants: Partial<Participant>[]): Promise<Participant[]>;
}

export interface IObservationRepository {
  saveAll(observations: Partial<Observation>[]): Promise<void>;
}

export interface IFindingRepository {
  saveAll(findings: Partial<Finding>[]): Promise<void>;
}

export interface IOrganizationRepository {
  create(name: string): Promise<string>;
  getByUser(userId: string): Promise<Organization[]>;
  getMemberCount(orgId: string): Promise<number>;
}

export interface IProjectRepository {
  create(orgId: string, name: string): Promise<string>;
  getByOrg(orgId: string): Promise<Project[]>;
  getMemberCount(projectId: string): Promise<number>;
  assignMember(projectId: string, userId: string): Promise<void>;
  removeMember(projectId: string, userId: string): Promise<void>;
}

export interface IMembershipRequestRepository {
  submit(orgId: string, userId: string): Promise<void>;
  getPendingForOrg(orgId: string): Promise<MembershipRequest[]>;
  getByUser(userId: string): Promise<MembershipRequest[]>;
  approve(requestId: string): Promise<void>;
  reject(requestId: string): Promise<void>;
}

export interface IOrganizationMemberRepository {
  getMembers(orgId: string): Promise<OrganizationMember[]>;
  addMember(orgId: string, userId: string, role: 'admin' | 'member'): Promise<void>;
  removeMember(orgId: string, userId: string): Promise<void>;
  isAdmin(orgId: string, userId: string): Promise<boolean>;
}
