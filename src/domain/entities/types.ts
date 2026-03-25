// src/domain/entities/types.ts

// Añadimos una constante vacía para que el módulo tenga presencia en tiempo de ejecución
export const SCHEMA_VERSION = "1.0";

export interface Participant {
  id: string;
  test_plan_id: string;
  name: string;
  profile: string;
}

export interface Task {
  id: string;
  test_plan_id: string;
  task_label: string;
  scenario: string;
  expected_result: string;
  main_metric: string;
  success_criteria: string;
  follow_up_question?: string;
  order_index: number;
}

export interface Observation {
  id: string;
  test_plan_id: string;
  participant_id: string;
  task_id: string;
  success: boolean;
  time_seconds: number;
  errors_count: number;
  key_comments: string;
  detected_problem: string;
  severity: 'Baja' | 'Media' | 'Alta' | 'Crítica' | '';
  proposed_improvement: string;
}

export interface Finding {
  id: string;
  test_plan_id: string;
  problem: string;
  evidence: string;
  frequency: string;
  severity: string;
  recommendation: string;
  priority: 'Baja' | 'Media' | 'Alta';
  status: 'Pendiente' | 'En Progreso' | 'Resuelto';
}

export interface DashboardMetrics {
  test_plan_id: string;
  product_name: string;
  test_date: string;
  total_observations: number;
  successful_tasks: number;
  avg_time_seconds: number;
  total_errors: number;
  success_rate: number;
}
