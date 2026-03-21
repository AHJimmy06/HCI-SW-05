import type { Task, Observation, Finding } from "@/domain/entities/types";

export interface ITestPlanRepository {
  create(plan: any): Promise<string>;
  getById(id: string): Promise<any>;
}

export interface ITaskRepository {
  saveAll(tasks: Partial<Task>[]): Promise<void>;
  getByPlanId(planId: string): Promise<Task[]>;
}

export interface IObservationRepository {
  save(observation: Partial<Observation>): Promise<void>;
  getByPlanId(planId: string): Promise<Observation[]>;
}

export interface IFindingRepository {
  save(finding: Partial<Finding>): Promise<void>;
  getByPlanId(planId: string): Promise<Finding[]>;
}
