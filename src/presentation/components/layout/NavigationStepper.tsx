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
import type { LucideIcon } from 'lucide-react';

const steps: { id: StepName; label: string; icon: LucideIcon; path: string }[] = [
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

  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const completedCount = steps.filter(step => validationStatus[step.id].isValid).length;
  const progress = Math.round((completedCount / steps.length) * 100);

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
    <div className="w-full px-6 py-4 bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200/80">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">Flujo de trabajo</p>
            <h2 className="text-sm font-bold text-slate-900">Navegación por etapas</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Progreso</p>
            <p className="text-sm font-bold text-slate-900">{progress}% completado</p>
          </div>
        </div>

        <div className="mb-4 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid grid-cols-4 gap-3 relative">
          {/* Connector background */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 z-0 hidden md:block" />
        
        {steps.map((step) => {
          const Icon = step.icon;
          const status = validationStatus[step.id];
          const isActive = currentStep === step.id;
          const isCompleted = status.isValid;
          const isReachable = step.id === currentStep || steps.findIndex(s => s.id === step.id) <= currentIndex + 1 || validationStatus[steps[Math.max(0, steps.findIndex(s => s.id === step.id) - 1)]?.id || 'plan']?.isValid;

          let colorClass = "text-slate-400 bg-slate-50 border-slate-200";

          if (isActive) {
            colorClass = "text-primary bg-white border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/10";
          } else if (isCompleted) {
            colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
              <button
                onClick={() => handleNavigate(step.path, step.id)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.label}${isCompleted ? ' - Completado' : isActive ? ' - Paso actual' : ' - Pendiente'}`}
                title={isReachable ? step.label : `${step.label} bloqueado hasta completar el paso anterior`}
                className={`
                  flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all duration-300
                  ${colorClass}
                  ${isReachable ? 'hover:-translate-y-0.5 active:scale-95' : 'opacity-70 cursor-not-allowed'}
                `}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Icon size={22} />
                )}
              </button>
              
              <div className="mt-2 flex flex-col items-center gap-0.5">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {isActive && !isCompleted && (
                  <span className="text-[10px] text-amber-600 font-semibold animate-pulse">
                    Incompleto
                  </span>
                )}
                {!isActive && isCompleted && (
                  <span className="text-[10px] text-emerald-600 font-semibold">Listo</span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
