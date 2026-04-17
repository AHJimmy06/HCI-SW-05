// src/domain/entities/types.ts

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

export interface FullTestPlan {
  id?: string;
  product_name: string;
  module_name: string;
  objective: string;
  user_profile: string;
  method: string;
  test_date: string;
  duration: string;
  place_channel: string;
  link_file: string;
  moderator_name: string;
  observer_name: string;
  tool_prototype: string;
  admin_notes: string;
  closing_easy: string;
  closing_confusing: string;
  closing_change: string;
  tasks: Task[];
  participants: Participant[];
  observations: (Observation & { participants?: Participant; tasks?: Task })[];
  findings: Finding[];
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

// Draft Types for Context
export interface TaskDraft extends Omit<Task, 'id' | 'test_plan_id' | 'order_index'> {
  id?: string;
}

export interface ObservationDraft {
  participant_name: string;
  participant_profile: string;
  task_label: string;
  success: 'Si' | 'No';
  time_seconds: string;
  errors_count: string;
  key_comments: string;
  detected_problem: string;
  severity: Observation['severity'];
  proposed_improvement: string;
}

export interface FindingDraft extends Omit<Finding, 'id' | 'test_plan_id'> {
  id?: string;
}

export interface FullTestData {
  test_plan_id?: string;
  plan: {
    product_name: string;
    module_name: string;
    objective: string;
    user_profile: string;
    method: string;
    test_date: string;
    duration: string;
    place_channel: string;
    link_file: string;
    moderator_name: string;
    observer_name: string;
    tool_prototype: string;
    admin_notes: string;
    closing_easy: string;
    closing_confusing: string;
    closing_change: string;
  };
  tasks: TaskDraft[];
  observations: ObservationDraft[];
  findings: FindingDraft[];
}

export type StepName = 'plan' | 'guide' | 'record' | 'synthesis';

export interface ValidationState {
  isValid: boolean;
  errors: string[];
}
