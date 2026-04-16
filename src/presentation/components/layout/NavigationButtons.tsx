import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useTestPlan } from "../../context/useTestPlan";
import type { StepName } from "../../../domain/entities/types";

interface NavigationButtonsProps {
  currentStep: StepName | 'dashboard';
}

const steps: { id: string; path: string; stepName?: StepName }[] = [
  { id: 'dashboard', path: '/' },
  { id: 'plan', path: '/plan', stepName: 'plan' },
  { id: 'guide', path: '/guia', stepName: 'guide' },
  { id: 'record', path: '/registro', stepName: 'record' },
  { id: 'synthesis', path: '/sintesis', stepName: 'synthesis' },
];

export function NavigationButtons({ currentStep }: NavigationButtonsProps) {
  const navigate = useNavigate();
  const { validationStatus, setAttemptedNext } = useTestPlan();
  const [showWarning, setShowWarning] = useState(false);

  // Mapeo manual para asegurar que los IDs de las páginas coincidan con StepName
  const stepMapping: Record<string, StepName | undefined> = {
    'plan': 'plan',
    'guia': 'guide',
    'guide': 'guide',
    'registro': 'record',
    'record': 'record',
    'sintesis': 'synthesis',
    'synthesis': 'synthesis'
  };

  const currentStepName = stepMapping[currentStep];
  const stepInfo = validationStatus[currentStepName as StepName];
  const isCurrentComplete = stepInfo ? stepInfo.isValid : true;
  const currentErrors = stepInfo ? stepInfo.errors : [];

  const currentIndex = steps.findIndex(s => s.id === currentStep || s.stepName === currentStepName);
  const prevStep = steps[currentIndex - 1];
  const nextStep = steps[currentIndex + 1];

  const handleNextClick = () => {
    if (!isCurrentComplete) {
      setAttemptedNext(true);
      setShowWarning(true);
      return;
    }
    setAttemptedNext(false);
    navigate(nextStep.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-10 border-t border-slate-200">
      <div className="w-full sm:w-auto flex justify-start">
        {prevStep && (
          <Button
            variant="ghost"
            onClick={() => navigate(prevStep.path)}
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
      </div>
    </div>
  );
}
