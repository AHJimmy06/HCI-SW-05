import { createContext, useContext, useState, type ReactNode } from 'react';

interface FullTestData {
  plan: {
    product_name: string;
    module_name: string;
    objective: string;
    user_profile: string;
    method: string;
    test_date: string;
    place_channel: string;
    moderator_name: string;
    observer_name: string;
    tool_prototype: string;
    admin_notes: string;
    closing_easy: string;
    closing_confusing: string;
    closing_change: string;
  };
  tasks: any[];
  observations: any[];
  findings: any[];
}

interface TestPlanContextType {
  data: FullTestData;
  updatePlan: (field: keyof FullTestData['plan'], value: string) => void;
  updateTasks: (tasks: any[]) => void;
  addTask: () => void;
  updateObservations: (observations: any[]) => void;
  addObservation: () => void;
  updateFindings: (findings: any[]) => void;
  addFinding: () => void;
  addMultipleTasks: (count: number) => void;
  addMultipleObservations: (count: number) => void;
  resetData: () => void;
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

const TestPlanContext = createContext<TestPlanContextType | undefined>(undefined);

export const TestPlanProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FullTestData>(initialData);

  const updatePlan = (field: keyof FullTestData['plan'], value: string) => {
    setData(prev => ({ ...prev, plan: { ...prev.plan, [field]: value } }));
  };

  const updateTasks = (tasks: any[]) => setData(prev => ({ ...prev, tasks }));
  const addTask = () => setData(prev => ({
    ...prev,
    tasks: [...prev.tasks, { task_label: `T${prev.tasks.length + 1}`, scenario: '', expected_result: '', main_metric: '', success_criteria: '', follow_up_question: '' }]
  }));

  const updateObservations = (observations: any[]) => setData(prev => ({ ...prev, observations }));
  const addObservation = () => setData(prev => ({
    ...prev,
    observations: [...prev.observations, { participant_name: '', participant_profile: '', task_label: '', success: 'Si', time_seconds: '', errors_count: '', key_comments: '', detected_problem: '', severity: 'Baja', proposed_improvement: '' }]
  }));

  const updateFindings = (findings: any[]) => setData(prev => ({ ...prev, findings }));
  const addFinding = () => setData(prev => ({
    ...prev,
    findings: [...prev.findings, { problem: '', evidence: '', frequency: '', severity: '', recommendation: '', priority: 'Media', status: 'Pendiente' }]
  }));

  const addMultipleTasks = (count: number) => setData(prev => {
    const newTasks = [...prev.tasks];
    for (let i = 0; i < count; i++) {
      newTasks.push({ 
        task_label: `T${newTasks.length + 1}`, 
        scenario: '', 
        expected_result: '', 
        main_metric: '', 
        success_criteria: '', 
        follow_up_question: '' 
      });
    }
    return { ...prev, tasks: newTasks };
  });

  const addMultipleObservations = (count: number) => setData(prev => {
    const newObs = [...prev.observations];
    for (let i = 0; i < count; i++) {
      newObs.push({ 
        participant_name: '', 
        participant_profile: '', 
        task_label: '', 
        success: 'Si', 
        time_seconds: '', 
        errors_count: '', 
        key_comments: '', 
        detected_problem: '', 
        severity: 'Baja', 
        proposed_improvement: '' 
      });
    }
    return { ...prev, observations: newObs };
  });

  const resetData = () => setData(initialData);

  return (
    <TestPlanContext.Provider value={{ 
      data, updatePlan, updateTasks, addTask, 
      updateObservations, addObservation, 
      updateFindings, addFinding, 
      addMultipleTasks, addMultipleObservations, resetData 
    }}>
      {children}
    </TestPlanContext.Provider>
  );
  };
export const useTestPlan = () => {
  const context = useContext(TestPlanContext);
  if (!context) throw new Error('useTestPlan must be used within a TestPlanProvider');
  return context;
};
