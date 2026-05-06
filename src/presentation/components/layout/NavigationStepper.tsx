import { useLocation, useNavigate } from 'react-router-dom';
import { useTestPlan } from '../../context/useTestPlan';
import { 
  ClipboardList, 
  BookOpen, 
  Edit3, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import type { StepName } from '../../../domain/entities/types';

const steps: { id: StepName; label: string; icon: any; path: string }[] = [
  { id: 'plan', label: 'Plan', icon: ClipboardList, path: '/dashboard/plan' },
  { id: 'guide', label: 'Guía', icon: BookOpen, path: '/dashboard/guia' },
  { id: 'record', label: 'Registro', icon: Edit3, path: '/dashboard/registro' },
  { id: 'synthesis', label: 'Síntesis', icon: Filter, path: '/dashboard/sintesis' },
];

export function NavigationStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { validationStatus } = useTestPlan();

  const getCurrentStep = (): StepName | null => {
    const path = location.pathname;
    if (path.endsWith('/plan')) return 'plan';
    if (path.endsWith('/guia')) return 'guide';
    if (path.endsWith('/registro')) return 'record';
    if (path.endsWith('/sintesis')) return 'synthesis';
    return null;
  };

  const currentStep = getCurrentStep();
  if (!currentStep) return null;

  const handleNavigate = (path: string, stepId: StepName) => {
    // Allows navigate if it's current step, or a previous step, or previous step is valid
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    // Derive projectId from sessionStorage and inject as query param
    const projectId = sessionStorage.getItem('active_project_id');
    const targetPath = projectId ? `${path}?project=${projectId}` : path;

    if (stepIndex <= currentIndex) {
      navigate(targetPath);
    } else {
      // To navigate forward, previous step must be valid
      const prevStep = steps[stepIndex - 1];
      if (validationStatus[prevStep.id].isValid) {
        navigate(targetPath);
      }
    }
  };

  return (
    <div className="w-full py-4 px-6 bg-white border-b border-slate-200">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {steps.map((step) => {
          const Icon = step.icon;
          const status = validationStatus[step.id];
          const isActive = currentStep === step.id;
          const isCompleted = status.isValid;

          let colorClass = "text-slate-400 bg-slate-50 border-slate-200";

          if (isActive) {
            colorClass = "text-primary bg-primary/10 border-primary ring-4 ring-primary/10";
          } else if (isCompleted) {
            colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => handleNavigate(step.path, step.id)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.label}${isCompleted ? ' - Completado' : isActive ? ' - Paso actual' : ' - Pendiente'}`}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${colorClass}
                  hover:scale-105 active:scale-95
                `}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Icon size={24} />
                )}
              </button>
              
              <div className="mt-2 flex flex-col items-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {isActive && !isCompleted && (
                  <span className="text-[10px] text-amber-600 font-medium animate-pulse">
                    Incompleto
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
