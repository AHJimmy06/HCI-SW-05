import type { DashboardMetrics, FullTestPlan, Task, Participant, Observation, Finding } from "../entities/types";

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
