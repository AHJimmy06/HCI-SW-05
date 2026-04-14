import { useContext } from 'react';
import { TestPlanContext } from './TestPlanContext';

export const useTestPlan = () => {
  const context = useContext(TestPlanContext);
  if (!context) throw new Error('useTestPlan must be used within a TestPlanProvider');
  return context;
};
