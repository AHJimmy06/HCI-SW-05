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

  async getAllMetrics(projectId?: string): Promise<DashboardMetrics[]> {
    // If projectId is provided, query directly without relying on the RLS-filtered view
    if (projectId) {
      const { data, error } = await supabase
        .from('test_plans')
        .select(`
          id,
          product_name,
          module_name,
          test_date,
          created_at,
          project_id
        `)
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('test_date', { ascending: false });

      if (error) throw new Error(error.message);

      // Get observation counts per plan
      const planIds = (data || []).map(p => p.id);
      let observationCounts: Record<string, number> = {};
      let taskSuccessCounts: Record<string, number> = {};
      let errorCounts: Record<string, number> = {};
      let timeSums: Record<string, number> = {};

      if (planIds.length > 0) {
        const { data: obs } = await supabase
          .from('observations')
          .select('test_plan_id, success, time_seconds, errors_count')
          .in('test_plan_id', planIds);

        if (obs) {
          obs.forEach(o => {
            const tid = o.test_plan_id;
            observationCounts[tid] = (observationCounts[tid] || 0) + 1;
            if (o.success) taskSuccessCounts[tid] = (taskSuccessCounts[tid] || 0) + 1;
            errorCounts[tid] = (errorCounts[tid] || 0) + (o.errors_count || 0);
            timeSums[tid] = (timeSums[tid] || 0) + (o.time_seconds || 0);
          });
        }
      }

      const metrics: DashboardMetrics[] = (data || []).map(p => {
        const totalObs = observationCounts[p.id] || 0;
        const successes = taskSuccessCounts[p.id] || 0;
        const totalErrors = errorCounts[p.id] || 0;
        const totalTime = timeSums[p.id] || 0;
        const successRate = totalObs > 0 ? Math.round((successes / totalObs) * 10000) / 100 : 0;

        return {
          test_plan_id: p.id,
          product_name: p.product_name + (p.module_name ? ` : ${p.module_name}` : ''),
          test_date: p.test_date || new Date(p.created_at).toISOString().split('T')[0],
          total_observations: totalObs,
          successful_tasks: successes,
          avg_time_seconds: totalObs > 0 ? Math.round(totalTime / totalObs) : 0,
          total_errors: totalErrors,
          success_rate: successRate,
          project_id: p.project_id
        };
      });

      return metrics;
    }

    // Default: use the RLS-filtered view for general dashboard
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
