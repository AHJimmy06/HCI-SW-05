import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { useTestPlan } from "../../context/useTestPlan";
import type { StepName } from "../../../domain/entities/types";

interface NavigationButtonsProps {
  currentStep: StepName | 'dashboard';
}

const steps: { id: string; path: string; stepName: StepName | 'dashboard' }[] = [
  { id: 'dashboard', path: '/dashboard', stepName: 'dashboard' },
  { id: 'plan', path: '/dashboard/plan', stepName: 'plan' },
  { id: 'guide', path: '/dashboard/guia', stepName: 'guide' },
  { id: 'record', path: '/dashboard/registro', stepName: 'record' },
  { id: 'synthesis', path: '/dashboard/sintesis', stepName: 'synthesis' },
];

export function NavigationButtons({ currentStep }: NavigationButtonsProps) {
  const navigate = useNavigate();
  const { validationStatus, setAttemptedNext, saveDraft } = useTestPlan();
  const [showWarning, setShowWarning] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSaveProgress = () => {
    saveDraft();
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  // Normalización y Blindaje: Si el paso no existe en validationStatus, asumimos válido para no romper.
  const currentStepName = currentStep === 'dashboard' ? 'dashboard' : currentStep as StepName;
  const stepInfo = (currentStepName !== 'dashboard' && validationStatus[currentStepName])
    ? validationStatus[currentStepName]
    : { isValid: true, errors: [] };

  const isCurrentComplete = stepInfo.isValid;
  const currentErrors = stepInfo.errors;

  const currentIndex = steps.findIndex(s => s.id === currentStep || s.stepName === currentStep);

  const prevStep = steps[currentIndex - 1];
  const nextStep = steps[currentIndex + 1];

  // Get project context for dashboard navigation
  const getDashboardPath = () => {
    const projectId = sessionStorage.getItem('active_project_id');
    if (projectId) return `/dashboard/project/${projectId}`;
    return '/dashboard';
  };

  const getTargetPath = (step: typeof steps[0]) => {
    if (step.id === 'dashboard') return getDashboardPath();
    // For wizard steps, inject projectId as query param
    const projectId = sessionStorage.getItem('active_project_id');
    return projectId ? `${step.path}?project=${projectId}` : step.path;
  };

  const handleNextClick = () => {
    if (!isCurrentComplete) {
      setAttemptedNext(true);
      setShowWarning(true);
      return;
    }

    if (nextStep) {
      setAttemptedNext(false);
      setShowWarning(false);
      navigate(getTargetPath(nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-10 border-t border-slate-200">
      <div className="w-full sm:w-auto flex justify-start">
        {prevStep && (
          <Button
            variant="ghost"
            onClick={() => navigate(getTargetPath(prevStep))}
            className="text-slate-700 hover:text-primary hover:bg-primary/10 flex items-center gap-2 px-6 py-6 rounded-xl transition-all font-semibold"
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <div className="flex flex-col items-start text-left">
              <span className="text-xs uppercase font-bold text-slate-500">Regresar</span>
              <span className="font-bold uppercase tracking-tight text-slate-900">Atrás</span>
            </div>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 w-full sm:w-auto relative">
        {!isCurrentComplete && showWarning && (
          <div
            role="alert"
            className="absolute -top-20 md:-top-16 flex flex-col items-center gap-1 text-red-900 bg-red-50 px-4 py-3 rounded-xl border-2 border-red-200 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50 w-max"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-tight">Faltan Datos</span>
            </div>
            <p className="text-[10px] font-bold text-red-700 text-center leading-tight">
              {currentErrors[0] || "Completa los campos obligatorios"}
            </p>
          </div>
        )}

        {nextStep && (
          <Button
            onClick={handleNextClick}
            disabled={!isCurrentComplete && !showWarning} // Solo habilitado si es válido o si queremos mostrar el error
            className={`w-full sm:w-auto flex items-center gap-4 px-10 py-8 rounded-2xl transition-all shadow-md group ${
              isCurrentComplete
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed"
            }`}
          >
            <div className="flex flex-col items-end text-right">
              <span className="text-xs uppercase font-bold opacity-90">Siguiente</span>
              <span className="text-lg font-bold uppercase tracking-tight">Avanzar</span>
            </div>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        )}

        {/* Botón Guardar Progreso */}
        {currentStep !== 'dashboard' && (
          <Button
            variant="outline"
            onClick={handleSaveProgress}
            className="w-full sm:w-auto flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all font-semibold"
          >
            <Save size={18} />
            <span>Guardar Progreso</span>
          </Button>
        )}

        {/* Toast de confirmación */}
        {showSaveConfirm && (
          <div className="absolute -top-16 right-0 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold">¡Guardado!</span>
          </div>
        )}
      </div>
    </div>
  );
}
