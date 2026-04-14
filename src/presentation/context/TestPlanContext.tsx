import { createContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { TaskDraft, ObservationDraft, FindingDraft, FullTestData } from '../../domain/entities/types';

interface TestPlanContextType {
  data: FullTestData;
  updatePlan: (field: keyof FullTestData['plan'], value: string) => void;
  updateTasks: (tasks: TaskDraft[]) => void;
  addTask: () => void;
  deleteTask: (index: number) => void;
  updateObservations: (observations: ObservationDraft[]) => void;
  addObservation: () => void;
  updateFindings: (findings: FindingDraft[]) => void;
  addFinding: () => void;
  updateTestPlanId: (id: string) => void;
  addMultipleTasks: (count: number) => void;
  addMultipleObservations: (count: number) => void;
  loadFullPlan: (plan: FullTestData) => void;
  resetData: () => void;
  isStepComplete: (step: 'plan' | 'guia' | 'registro' | 'sintesis') => boolean;
  isEditing: boolean;
}

const initialData: FullTestData = {
  plan: {
    product_name: '', module_name: '', objective: '', user_profile: '',
    method: '', test_date: '', place_channel: '', moderator_name: '',
    observer_name: '', tool_prototype: '', admin_notes: '',
    closing_easy: '', closing_confusing: '', closing_change: '',
  },
  tasks: [{ task_label: 'T1', scenario: '', expected_result: '', main_metric: '', success_criteria: '', follow_up_question: '' }],
  observations: [{ participant_name: '', participant_profile: '', task_label: '', success: 'Si', time_seconds: '', errors_count: '', key_comments: '', detected_problem: '', severity: 'Baja', proposed_improvement: '' }],
  findings: [{ problem: '', evidence: '', frequency: '', severity: '', recommendation: '', priority: 'Media', status: 'Pendiente' }],
};

export const TestPlanContext = createContext<TestPlanContextType | undefined>(undefined);

export const TestPlanProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FullTestData>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const updatePlan = useCallback((field: keyof FullTestData['plan'], value: string) => {
    setData(prev => ({ ...prev, plan: { ...prev.plan, [field]: value } }));
  }, []);

  const updateTasks = useCallback((tasks: TaskDraft[]) => setData(prev => ({ ...prev, tasks })), []);

  const addTask = useCallback(() => setData(prev => {
    const newTasks = [...prev.tasks, { task_label: '', scenario: '', expected_result: '', main_metric: '', success_criteria: '', follow_up_question: '' }];
    return {
      ...prev,
      tasks: newTasks.map((t, i) => ({ ...t, task_label: `T${i + 1}` }))
    };
  }), []);

  const deleteTask = useCallback((index: number) => {
    setData(prev => {
      if (prev.tasks.length <= 1) return prev;
      const oldLabel = prev.tasks[index].task_label;
      const newTasks = prev.tasks
        .filter((_, i) => i !== index)
        .map((t, i) => ({ ...t, task_label: `T${i + 1}` }));

      const newObservations = prev.observations.map(obs => {
        if (obs.task_label === oldLabel) return { ...obs, task_label: '' };
        const taskMatchIndex = prev.tasks.findIndex(t => t.task_label === obs.task_label);
        if (taskMatchIndex !== -1) {
          if (taskMatchIndex < index) return obs;
          return { ...obs, task_label: `T${taskMatchIndex}` };
        }
        return obs;
      });
      return { ...prev, tasks: newTasks, observations: newObservations };
    });
  }, []);

  const updateObservations = useCallback((observations: ObservationDraft[]) => setData(prev => ({ ...prev, observations })), []);
  const addObservation = useCallback(() => setData(prev => ({
    ...prev,
    observations: [...prev.observations, { participant_name: '', participant_profile: '', task_label: '', success: 'Si', time_seconds: '', errors_count: '', key_comments: '', detected_problem: '', severity: 'Baja', proposed_improvement: '' }]
  })), []);

  const updateFindings = useCallback((findings: FindingDraft[]) => setData(prev => ({ ...prev, findings })), []);
  const addFinding = useCallback(() => setData(prev => ({
    ...prev,
    findings: [...prev.findings, { problem: '', evidence: '', frequency: '', severity: '', recommendation: '', priority: 'Media', status: 'Pendiente' }]
  })), []);

  const updateTestPlanId = useCallback((id: string) => {
    setData(prev => ({ ...prev, test_plan_id: id }));
  }, []);

  const addMultipleTasks = useCallback((count: number) => setData(prev => {
    const newTasks = [...prev.tasks];
    for (let i = 0; i < count; i++) {
      newTasks.push({ task_label: '', scenario: '', expected_result: '', main_metric: '', success_criteria: '', follow_up_question: '' });
    }
    return { ...prev, tasks: newTasks.map((t, i) => ({ ...t, task_label: `T${i + 1}` })) };
  }), []);

  const addMultipleObservations = useCallback((count: number) => setData(prev => {
    const newObs = [...prev.observations];
    for (let i = 0; i < count; i++) {
      newObs.push({ participant_name: '', participant_profile: '', task_label: '', success: 'Si', time_seconds: '', errors_count: '', key_comments: '', detected_problem: '', severity: 'Baja', proposed_improvement: '' });
    }
    return { ...prev, observations: newObs };
  }), []);

  const loadFullPlan = useCallback((planData: FullTestData) => {
    setData(planData);
    setIsEditing(true);
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
    setIsEditing(false);
  }, []);

  const checkStepComplete = useCallback((step: 'plan' | 'guia' | 'registro' | 'sintesis', currentData: FullTestData, editing: boolean): boolean => {
    if (editing) return true;
    
    const isPlanComplete = currentData.plan.product_name.trim() !== '' && 
                          currentData.plan.objective.trim() !== '' && 
                          currentData.tasks.some(t => (t.scenario || '').trim() !== '');
    
    switch (step) {
      case 'plan':
        return isPlanComplete;
      case 'guia': 
        return isPlanComplete;
      case 'registro': 
        return isPlanComplete && currentData.observations.some(o => (o.participant_name || '').trim() !== '');
      case 'sintesis': 
        return isPlanComplete && 
               currentData.observations.some(o => (o.participant_name || '').trim() !== '') && 
               currentData.findings.some(f => (f.problem || '').trim() !== '');
      default: 
        return false;
    }
  }, []);

  const isStepComplete = useCallback((step: 'plan' | 'guia' | 'registro' | 'sintesis'): boolean => {
    return checkStepComplete(step, data, isEditing);
  }, [data, isEditing, checkStepComplete]);

  const value = useMemo(() => ({
    data, updatePlan, updateTasks, addTask, deleteTask,
    updateObservations, addObservation, 
    updateFindings, addFinding, updateTestPlanId,
    addMultipleTasks, addMultipleObservations, resetData,
    loadFullPlan, isStepComplete, isEditing
  }), [
    data, updatePlan, updateTasks, addTask, deleteTask,
    updateObservations, addObservation, 
    updateFindings, addFinding, updateTestPlanId,
    addMultipleTasks, addMultipleObservations, resetData,
    loadFullPlan, isStepComplete, isEditing
  ]);

  return (
    <TestPlanContext.Provider value={value}>
      {children}
    </TestPlanContext.Provider>
  );
};
