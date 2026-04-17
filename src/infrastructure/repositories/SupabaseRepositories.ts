import { supabase } from '../config/supabase';
import type { 
  ITestPlanRepository, 
  ITaskRepository, 
  IObservationRepository, 
  IFindingRepository,
  IParticipantRepository 
} from '../../domain/repositories/interfaces';
import type { Task, Observation, Finding, Participant, FullTestPlan, DashboardMetrics } from '../../domain/entities/types';

export class SupabaseTestPlanRepository implements ITestPlanRepository {
  async create(plan: Omit<FullTestPlan, 'id' | 'tasks' | 'participants' | 'observations' | 'findings'>): Promise<string> {
    const { data, error } = await supabase
      .from('test_plans')
      .insert(plan)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  async update(id: string, plan: Partial<Omit<FullTestPlan, 'id' | 'tasks' | 'participants' | 'observations' | 'findings'>>): Promise<void> {
    const { error } = await supabase
      .from('test_plans')
      .update(plan)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('test_plans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getById(id: string): Promise<FullTestPlan> {
    const { data, error } = await supabase
      .from('test_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getFullPlan(id: string): Promise<FullTestPlan> {
    const { data, error } = await supabase
      .from('test_plans')
      .select(`
        *,
        tasks (*),
        findings (*),
        observations (
          *,
          participants (*),
          tasks (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllMetrics(): Promise<DashboardMetrics[]> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .order('test_date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SupabaseParticipantRepository implements IParticipantRepository {
  async saveAll(participants: Partial<Participant>[]): Promise<Participant[]> {
    if (participants.length === 0) return [];

    // Usamos upsert basado en el constraint (test_plan_id, name)
    const { data, error } = await supabase
      .from('participants')
      .upsert(participants, { onConflict: 'test_plan_id, name' })
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getByPlanId(planId: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('test_plan_id', planId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SupabaseTaskRepository implements ITaskRepository {
  async saveAll(tasks: Partial<Task>[]): Promise<void> {
    if (tasks.length === 0) return;

    // Usamos upsert basado en el constraint (test_plan_id, task_label)
    const { error } = await supabase
      .from('tasks')
      .upsert(tasks, { onConflict: 'test_plan_id, task_label' });

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
      .insert(observation);

    if (error) throw new Error(error.message);
  }

  async saveAll(observations: Partial<Observation>[]): Promise<void> {
    if (observations.length === 0) return;
    
    // Las observaciones no tienen constraint de unicidad natural (pueden haber varias para el mismo par task/part).
    // Por seguridad, para el flujo de guardado completo, borramos e insertamos pero con una sola transacción lógica.
    // Al ser un flujo secuencial, el bloqueo en el UI evitará la concurrencia.
    if (observations[0].test_plan_id) {
      await supabase.from('observations').delete().eq('test_plan_id', observations[0].test_plan_id);
    }
    
    const { error } = await supabase
      .from('observations')
      .insert(observations);

    if (error) throw new Error(error.message);
  }

  async getByPlanId(planId: string): Promise<Observation[]> {
    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .eq('test_plan_id', planId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export class SupabaseFindingRepository implements IFindingRepository {
  async save(finding: Partial<Finding>): Promise<void> {
    const { error } = await supabase
      .from('findings')
      .insert(finding);

    if (error) throw new Error(error.message);
  }

  async saveAll(findings: Partial<Finding>[]): Promise<void> {
    if (findings.length === 0) return;

    // Los hallazgos se borran y re-crean para simplificar el flujo de edición.
    if (findings[0].test_plan_id) {
      await supabase.from('findings').delete().eq('test_plan_id', findings[0].test_plan_id);
    }

    const { error } = await supabase
      .from('findings')
      .insert(findings);

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
