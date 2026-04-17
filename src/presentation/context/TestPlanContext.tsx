import { createContext, useState, useMemo, type ReactNode, useCallback, useEffect, useRef } from 'react';
import type { TaskDraft, ObservationDraft, FindingDraft, FullTestData, StepName, ValidationState } from '../../domain/entities/types';
import { loadStorage, saveStorage } from '../../lib/utils';

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
  isStepComplete: (step: StepName) => boolean;
  isEditing: boolean;
  isDirty: boolean;
  isDraftSaved: boolean;
  lastSaved: Date | null;
  validationStatus: Record<StepName, ValidationState>;
  validateCurrentStep: (step: StepName) => boolean;
  saveDraft: () => void;
  clearDraft: () => void;
  hasDraft: boolean;
  attemptedNext: boolean;
  setAttemptedNext: (val: boolean) => void;
}

const STORAGE_KEY = 'usability_test_draft';

const initialData: FullTestData = {
  plan: {
    product_name: '', module_name: '', objective: '', user_profile: '',
    method: '',
    test_date: '',
    duration: '',
    place_channel: '', 
    link_file: '',
    moderator_name: '',
    observer_name: '', tool_prototype: '', admin_notes: '',
    closing_easy: '', closing_confusing: '', closing_change: '',
  },
  tasks: [{ task_label: 'T1', scenario: '', expected_result: '', main_metric: '', success_criteria: '', follow_up_question: '' }],
  observations: [{ participant_name: '', participant_profile: '', task_label: '', success: 'Si', time_seconds: '', errors_count: '', key_comments: '', detected_problem: '', severity: 'Baja', proposed_improvement: '' }],
  findings: [{ problem: '', evidence: '', frequency: '', severity: 'Baja', recommendation: '', priority: 'Media', status: 'Pendiente' }],
};

export const TestPlanContext = createContext<TestPlanContextType | undefined>(undefined);

export const TestPlanProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FullTestData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const isFirstRender = useRef(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = loadStorage<FullTestData>(STORAGE_KEY);
      if (saved && typeof saved === 'object') {
        // Robustness check: Ensure it looks like a Test Plan and has mandatory arrays
        const tasks = Array.isArray(saved.tasks) ? saved.tasks : initialData.tasks;
        const observations = Array.isArray(saved.observations) ? saved.observations : initialData.observations;
        const findings = Array.isArray(saved.findings) ? saved.findings : initialData.findings;
        const plan = (saved.plan && typeof saved.plan === 'object') ? saved.plan : initialData.plan;

        setData({ ...saved, plan, tasks, observations, findings });
        setHasDraft(true);
      }
    } catch (error) {
      console.error("Error loading draft from storage:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save to LocalStorage with debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveStorage(STORAGE_KEY, data);
      setIsDraftSaved(true);
      setLastSaved(new Date());
    }, 2000);

    setIsDraftSaved(false);
    setIsDirty(true);

    return () => clearTimeout(timer);
  }, [data]);

  const saveDraft = useCallback(() => {
    saveStorage(STORAGE_KEY, data);
    setIsDraftSaved(true);
    setLastSaved(new Date());
  }, [data]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialData);
    setHasDraft(false);
    setIsDirty(false);
  }, []);

  const validationStatus = useMemo<Record<StepName, ValidationState>>(() => {
    // 1. Plan: Requiere casi todo (Cimientos sólidos)
    const p = data.plan;
    const planValid = (p?.product_name || '').trim() !== '' && 
                     (p?.module_name || '').trim() !== '' &&
                     (p?.objective || '').trim() !== '' &&
                     (p?.user_profile || '').trim() !== '' &&
                     (p?.method || '').trim() !== '' &&
                     (p?.moderator_name || '').trim() !== '' &&
                     (p?.observer_name || '').trim() !== '' &&
                     (p?.tool_prototype || '').trim() !== '' &&
                     (p?.place_channel || '').trim() !== '';
    
    // 2. Guía: Requiere tareas completas Y guion de entrevista definido
    const g = data.plan;
    const guideValid = Array.isArray(data.tasks) && 
                       data.tasks.length > 0 && 
                       data.tasks.every(t => 
                         (t?.scenario || '').trim() !== '' &&
                         (t?.follow_up_question || '').trim() !== ''
                       ) &&
                       (g?.closing_easy || '').trim() !== '' &&
                       (g?.closing_confusing || '').trim() !== '' &&
                       (g?.closing_change || '').trim() !== '';
    
    // 3. Registro: Todos los campos son obligatorios
    const recordValid = Array.isArray(data.observations) && 
                       data.observations.length > 0 && 
                       data.observations.every(o => 
                         (o?.participant_name || '').trim() !== '' && 
                         (o?.participant_profile || '').trim() !== '' && 
                         (o?.task_label || '').trim() !== '' && 
                         o?.time_seconds !== '' && 
                         !isNaN(Number(o?.time_seconds)) &&
                         Number(o?.time_seconds) > 0 &&
                         (o?.key_comments || '').trim() !== '' &&
                         (o?.detected_problem || '').trim() !== '' &&
                         (o?.severity || '').trim() !== '' &&
                         (o?.proposed_improvement || '').trim() !== ''
                       );
    
    // 4. Síntesis: Requiere al menos un hallazgo con problema definido
    const synthesisValid = Array.isArray(data.findings) && 
                          data.findings.length > 0 && 
                          data.findings.some(f => (f?.problem || '').trim() !== '');

    return {
      plan: { 
        isValid: planValid, 
        errors: planValid ? [] : ['Completa todos los campos obligatorios de contexto y logística.'] 
      },
      guide: { 
        isValid: guideValid, 
        errors: guideValid ? [] : ['Debes definir al menos un escenario de tarea en el plan.'] 
      },
      record: { 
        isValid: recordValid, 
        errors: recordValid ? [] : ['Registra al menos un participante con un tiempo de ejecución válido.'] 
      },
      synthesis: { 
        isValid: synthesisValid, 
        errors: synthesisValid ? [] : ['Debes registrar al menos un hallazgo para cerrar la misión.'] 
      },
    };
  }, [data]);

  const validateCurrentStep = useCallback((step: StepName): boolean => {
    return validationStatus[step]?.isValid || false;
  }, [validationStatus]);

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
    setIsDirty(false);
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
    setIsEditing(false);
    setIsDirty(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isStepComplete = useCallback((step: StepName): boolean => {
    return validationStatus[step]?.isValid || false;
  }, [validationStatus]);

  const value = useMemo(() => ({
    data, updatePlan, updateTasks, addTask, deleteTask,
    updateObservations, addObservation, 
    updateFindings, addFinding, updateTestPlanId,
    addMultipleTasks, addMultipleObservations, resetData,
    loadFullPlan, isStepComplete, isEditing,
    isDirty, isDraftSaved, lastSaved, validationStatus, validateCurrentStep, saveDraft, attemptedNext, setAttemptedNext,
    hasDraft, clearDraft
  }), [
    data, updatePlan, updateTasks, addTask, deleteTask,
    updateObservations, addObservation, 
    updateFindings, addFinding, updateTestPlanId,
    addMultipleTasks, addMultipleObservations, resetData,
    loadFullPlan, isStepComplete, isEditing,
    isDirty, isDraftSaved, lastSaved, validationStatus, validateCurrentStep, saveDraft, attemptedNext,
    hasDraft, clearDraft
  ]);

  return (
    <TestPlanContext.Provider value={value}>
      {children}
    </TestPlanContext.Provider>
  );
};
