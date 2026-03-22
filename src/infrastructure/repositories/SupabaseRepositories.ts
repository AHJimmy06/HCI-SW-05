import { supabase } from '../config/supabase';
import type { ITestPlanRepository, ITaskRepository, IObservationRepository, IFindingRepository } from '../../domain/repositories/interfaces';
import type { Task, Observation, Finding, DashboardMetrics } from '../../domain/entities/types';

export class SupabaseTestPlanRepository implements ITestPlanRepository {
  async create(plan: any): Promise<string> {
    const { data, error } = await supabase
      .from('test_plans')
      .insert([plan])
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  async getById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('test_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllMetrics(): Promise<DashboardMetrics[]> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getFullPlan(id: string): Promise<any> {
    const { data: plan, error: planError } = await supabase
      .from('test_plans')
      .select('*, tasks(*), findings(*), observations(*)')
      .eq('id', id)
      .single();

    if (planError) throw new Error(planError.message);
    return plan;
  }
}

export class SupabaseTaskRepository implements ITaskRepository {
  async saveAll(tasks: Partial<Task>[]): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .insert(tasks);

    if (error) throw new Error(error.message);
  }

  async getByPlanId(planId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('test_plan_id', planId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SupabaseObservationRepository implements IObservationRepository {
  async save(observation: Partial<Observation>): Promise<void> {
    const { error } = await supabase
      .from('observations')
      .insert([observation]);

    if (error) throw new Error(error.message);
  }

  async getByPlanId(planId: string): Promise<Observation[]> {
    const { data, error } = await supabase
      .from('observations')
      .select('*, participants(*), tasks(*)')
      .eq('test_plan_id', planId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SupabaseFindingRepository implements IFindingRepository {
  async save(finding: Partial<Finding>): Promise<void> {
    const { error } = await supabase
      .from('findings')
      .insert([finding]);

    if (error) throw new Error(error.message);
  }

  async getByPlanId(planId: string): Promise<Finding[]> {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('test_plan_id', planId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
