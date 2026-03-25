import type { Task, Observation, Finding, Participant } from "@/domain/entities/types";

export interface ITestPlanRepository {
  create(plan: any): Promise<string>;
  update(id: string, plan: any): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<any>;
  getAllMetrics(): Promise<any[]>;
  getFullPlan(id: string): Promise<any>;
}

export interface IParticipantRepository {
  saveAll(participants: Partial<Participant>[]): Promise<Participant[]>;
  getByPlanId(planId: string): Promise<Participant[]>;
}

export interface ITaskRepository {
  saveAll(tasks: Partial<Task>[]): Promise<void>;
  getByPlanId(planId: string): Promise<Task[]>;
}

export interface IObservationRepository {
  save(observation: Partial<Observation>): Promise<void>;
  saveAll(observations: Partial<Observation>[]): Promise<void>;
  getByPlanId(planId: string): Promise<Observation[]>;
}

export interface IFindingRepository {
  save(finding: Partial<Finding>): Promise<void>;
  saveAll(findings: Partial<Finding>[]): Promise<void>;
  getByPlanId(planId: string): Promise<Finding[]>;
}
